import fs from 'fs'
import {promisify} from 'util'
import path from 'path'
import aws from 'aws-sdk'
import mime from 'mime'
import isGzip from 'is-gzip'
import readChunk from 'read-chunk'
import chalk from 'chalk'
import {pascalCase, isUpperCase} from 'change-case'
import ora from 'ora'
import rimraf from 'rimraf'
import webpack from 'webpack'
import minimatch from 'minimatch'
import deepMerge from 'deepmerge'


const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

function writeClientStats (filename, data) {
  return Promise.all([
    writeFile(
      filename,
      JSON.stringify({
        publicPath: data.publicPath,
        chunks: data.chunks,
        assets: data.assets
      }),
      'utf8'
    ),

    writeFile(filename.replace('.json', '.all.json'), JSON.stringify(data), 'utf8')
  ])
}

async function readClientStats (filename) {
  return JSON.parse(await readFile(filename, 'utf8'))
}

function getCredentials (credentials = {}) {
  if (credentials.accessKeyId) {
    return new aws.Credentials(credentials)
  }

  if (credentials.profile === void 0 && process.env.AWS_PROFILE) {
    credentials.profile = process.env.AWS_PROFILE
  }

  return new aws.SharedIniFileCredentials(credentials)
}

function getReadStream (filename, opt) {
  const stream = fs.createReadStream(filename, opt)
  stream.on('error', err => {
    if (err) {
      throw err
    }
  })

  return stream
}

function transformParams (params) {
  if (params) {
    const out = {}

    Object.keys(params).forEach(key => {
      out[isUpperCase(key.charAt(0)) ? key : pascalCase(key)] = params[key]
    })

    return out
  }
}

// replaces [filename] [basename] [file] [ext] [dirname] [publicPath] for
// more customizable and granular key names
function fillPlaceholders (key, filename, replacements = {}) {
  const ext = path.extname(filename)
  key = key
    .replace('[filename]', filename)
    .replace('[basename]', path.basename(filename))
    .replace('[file]', path.basename(filename, ext))
    .replace('[ext]', ext)
    .replace('[dirname]', path.dirname(filename))
  Object.keys(replacements).forEach(k => key = key.replace(`[${k}]`, replacements[k]))
  return key.replace(/^\//, '')
}

async function uploadToS3 (
  assets,
  {
    outputPath,
    publicPath,
    credentials,
    object,
    bucket,
    ...s3Config
  }
) {
  const filenames =
    Array.isArray(assets)
      ? assets.map(asset => asset.name)
      : Object.keys(assets)
  const s3 = new aws.S3({credentials: getCredentials(credentials), ...s3Config})
  const uploads = []

  filenames.forEach(
    (filename, i) => {
      // opens up a file stream from the local file
      const absoluteName = path.join(outputPath, filename)

      // gets the config for this type of file
      let config = {
        key: '[filename]',
        params: {}
      }

      if (object) {
        for (let glob in object) {
          if (glob === '*' || minimatch(filename, glob) === true) {
            config = deepMerge(config, object[glob])
          }
        }
      }

      // creates the params object for upload()
      const params = {
        Bucket: bucket,
        Body: getReadStream(absoluteName),
        ...transformParams(config.params),
        Key: fillPlaceholders(config.key, filename, {publicPath}),
        ContentType: (
          config.params.contentType === 'auto' || config.params.contentType === void 0
            ? mime.getType(filename)
            : config.params.contentType
        ),
      }

      // prepares gzipped content with proper Content-Encoding header
      if (!params.ContentEncoding && isGzip(readChunk.sync(absoluteName, 0, 1024))) {
        params.ContentEncoding = 'gzip'
      }

      // start the upload
      uploads.push(s3.upload(params).promise())
    }
  )

  return Promise.all(uploads)
}

module.exports = class ServerlessPlugin {
  constructor(serverless, options) {
    this.name = 'serverless-deploy-client-bundle'
    this.serverless = serverless
    this.config = {statsFile: 'stats.json', ...serverless.service?.custom?.deployClientBundle}
    this.servicePath = serverless.config.servicePath
    this.options = options
    this.spinner = ora({spinner: 'star2'})

    this.commands = {
      'create-bucket': {
        usage: 'Creates the S3 bucket referenced in the config',
        lifecycleEvents: [
          'create'
        ]
      },
      'build-client': {
        usage: 'Builds the client-side code for your web application',
        lifecycleEvents: [
          'build'
        ]
      },
      'deploy-client': {
        usage: 'Builds and deploys your client-side code to S3',
        lifecycleEvents: [
          'build',
          'upload',
        ]
      },
      'upload-client': {
        usage: 'Uploads your client-side code to S3 without building it',
        lifecycleEvents: [
          'upload'
        ]
      },
    }

    this.hooks = {
      // 'before:package:createDeploymentArtifacts': ,
      'after:package:initialize': this.createBucket,
      'before:package:createDeploymentArtifacts': () => this.build().then(this.upload),
      'before:deploy:function:packageFunction': () => this.build().then(this.upload),
      'build-client:build': this.build,
      'deploy-client:build': this.build,
      'deploy-client:upload': this.upload,
      'upload-client:upload': this.upload,
      'create-bucket:create': this.createBucket
    }
  }

  get webpackConfig () {
    if (this.config === void 0 || this.config.webpackConfig === void 0) {
      throw (
        chalk.bold.red(`[${this.name}] error: `)
        + `Configuration must include a path to your webpack config at: `
        + chalk.bold(`custom.deployClientBundle.webpackConfig`)
      )
    }

    // loads the Webpack configuration from the specified location relative to the Serverless
    // service configuration
    const webpackConfig = path.join(this.servicePath, this.config.webpackConfig)
    return require(webpackConfig)
  }

  log (msg) {
    this.serverless.cli.log(msg, this.name)
  }

  build = async () => {
    // initializes the Webpack instance with its config
    this.spinner.start('Building the client bundle...')
    const compiler = webpack(this.webpackConfig)
    const outputPath = this.webpackConfig.output.path
    const publicPath = this.webpackConfig.output.publicPath || '/public/'
    // cleans up the current distribution
    rimraf.sync(outputPath)

    // builds the bundle in Webpack
    let clientStats = await new Promise(
      (resolve, reject) => compiler.run(
        (err, stats) => {
          if (err || stats.hasErrors()) {
            this.spinner.fail(chalk.bold('Compilation error'))
            throw stats.compilation.errors.join('\n\n')
          }

          this.spinner.succeed('Finished building the client bundle')

          // passes any Webpack warnings to the user
          if (stats.compilation.warnings.length) {
            console.log('\n')
            for (let warning of stats.compilation.warnings) {
              console.log(chalk.yellow(`Webpack warning`), warning.message, '\n')
            }
          }

          resolve(stats)
        }
      )
    )

    // writes the client stats to the local client dist directory
    await writeClientStats(path.join(outputPath, this.config.statsFile), clientStats.toJson())
  }

  upload = async () => {
    // upload the bundle assets to S3
    this.spinner.start(`Uploading bundle to ${chalk.bold(this.config.s3.bucket)}`)
    const outputPath = this.webpackConfig.output.path
    const publicPath = this.webpackConfig.output.publicPath || '/public/'
    const clientStats = await readClientStats(path.join(outputPath, this.config.statsFile))
    await uploadToS3(clientStats.assets, {outputPath, publicPath, ...this.config.s3})
    this.spinner.succeed(`Uploaded bundle to ${chalk.bold(this.config.s3.bucket)}`)
  }

  createBucket = () => {
    if (this.config?.s3?.bucket === void 0) {
      throw (
        chalk.bold.red(`[${this.name}] error: `)
        + `Configuration must include an S3 bucket definition at: `
        + chalk.bold(`custom.deployClientBundle.s3.bucket`)
      )
    }

    this.log(`Creating bucket ${chalk.bold(this.config.s3.bucket)}`)
  }
}