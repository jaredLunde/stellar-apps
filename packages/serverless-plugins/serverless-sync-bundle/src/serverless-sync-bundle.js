import fs from 'fs'
import path from 'path'
import aws from 'aws-sdk'
import mime from 'mime'
import isGzip from 'is-gzip'
import readChunk from 'read-chunk'
import chalk from 'chalk'
import {pascalCase, isUpperCase} from 'change-case'
import ora from 'ora'
import isPlainObject from 'is-plain-object'
import rimraf from 'rimraf'
import webpack from 'webpack'
import minimatch from 'minimatch'
import deepMerge from 'deepmerge'


function getCredentials (credentials = {}) {
  if (credentials.accessKeyId) {
    return new aws.Credentials(
      credentials.accessKeyId,
      credentials.secretAccessKey,
      credentials.sessionToken || null
    )
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
  if (isPlainObject(params)) {
    const out = {}

    Object.keys(params).forEach(key => {
      out[isUpperCase(key.charAt(0)) ? key : pascalCase(key)] =
        key.toLowerCase() === 'metadata' ? params[key] : transformParams(params[key])
    })

    return out
  }
  else if (Array.isArray(params)) {
    return params.map(transformParams)
  }

  return params
}

// replaces [filename] [basename] [file] [ext] [dirname] for
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
    credentials,
    object,
    bucket,
    params = {}
  }
) {
  const filenames =
    Array.isArray(assets)
      ? assets.map(asset => asset.name)
      : Object.keys(assets)
  const s3 = new aws.S3({credentials: getCredentials(credentials), ...params})
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

        if (config.exclude === true) {
          return
        }
      }

      // creates the params object for upload()
      const params = {
        Bucket: bucket.name,
        Prefix: bucket.prefix,
        Body: getReadStream(absoluteName),
        ...transformParams(config.params),
        Key: fillPlaceholders(config.key, filename),
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

async function emptyBucket ({bucket, credentials, params = {}}) {
  const s3 = new aws.S3({credentials: getCredentials(credentials), ...params})
  let removals = [],
      ContinuationToken

  while (true) {
    const response = await s3.listObjectsV2({Bucket: bucket.name, Prefix: bucket.prefix}).promise()

    response.Contents.forEach(
      ({Key}) => removals.push(s3.deleteObject({Key, Bucket: bucket.name}).promise())
    )


    ContinuationToken = response.NextContinuationToken

    if (!ContinuationToken) {
      break
    }
  }

  return Promise.all(removals)
}

module.exports = class ServerlessPlugin {
  constructor(serverless, options) {
    this.name = 'serverless-sync-bundle'
    this.serverless = serverless
    this.servicePath = serverless.config.servicePath
    this.options = options
    this.spinner = ora({spinner: 'star2'})
    this.commands = {
      'bundle': {
        usage: 'Bundles code for your web application',
        lifecycleEvents: [
          'build'
        ]
      },
      'sync-bundle': {
        usage: 'Builds and deploys your code to S3',
        lifecycleEvents: [
          'build',
          'upload',
        ]
      },
      'empty-bundle-buckets': {
        usage: 'Empties the S3 buckets referenced in the config',
        lifecycleEvents: [
          'empty'
        ]
      },
    }

    this.hooks = {
      // runs before deploying on `sls deploy`
      'before:package:createDeploymentArtifacts': this.syncAll,
      // runs before `sls deploy -f [func]`
      'before:deploy:function:packageFunction': this.syncAll,
      // runs before `sls remove`
      'before:remove:remove': this.empty,
      // command hooks
      'bundle:build': this.bundleAll,
      'sync-bundle:build': this.syncAll,
      'empty-bundle-buckets:empty': this.emptyAll
    }
  }

  get config () {
    return this.serverless.service?.custom?.syncBundle
  }

  getConfig (webpackConfigFile) {
    return {
      credentials: {
        profile: this.serverless.service?.provider?.profile
      },
      ...this.config[webpackConfigFile]
    }
  }

  log (msg) {
    this.serverless.cli.log(msg, this.name)
  }

  syncAll = async () => {
    for (let configFile in this.config) {
      await this.bundle(configFile).then(this.sync)
    }
  }

  bundleAll = async () => {
    for (let configFile in this.config) {
      await this.bundle(configFile)
    }
  }

  emptyAll = async () => {
    for (let configFile in this.config) {
      await this.empty(configFile)
    }
  }

  bundle = async webpackConfigFile => {
    const webpackConfig = require(path.join(this.servicePath, webpackConfigFile))
    const config = this.getConfig(webpackConfigFile)

    // initializes the Webpack instance with its config
    this.spinner.start(`Bundling ${chalk.bold(webpackConfig.name)}...`)
    const compiler = webpack(webpackConfig)
    const outputPath = webpackConfig.output.path
    // cleans up the current distribution
    rimraf.sync(outputPath)

    // builds the bundle in Webpack
    let clientStats = await new Promise(
      resolve => compiler.run(
        (err, stats) => {
          if (err || stats.hasErrors()) {
            this.spinner.fail(chalk.bold('Compilation error'))
            throw stats.compilation.errors.join('\n\n')
          }

          this.spinner.succeed(`Finished bundling ${chalk.bold(webpackConfig.name)}`)

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

    return {clientStats, outputPath, config}
  }

  sync = async ({clientStats, outputPath, config}) => {
    this.spinner.start(`Uploading bundle to ${chalk.bold(config.bucket.name)}...`)
    await uploadToS3(clientStats.compilation.assets, {outputPath, ...config})
    this.spinner.succeed(`Uploaded bundle to ${chalk.bold(config.bucket.name)}`)
  }

  empty = async webpackConfigFile => {
    // Empties the s3 bucket unless retained
    const config = this.getConfig(webpackConfigFile)

    if (!config.bucket?.retain) {
      this.spinner.start(`Emptying ${chalk.bold(config.bucket.name)}...`)
      await emptyBucket(config)
      this.spinner.succeed(`Emptied ${chalk.bold(config.bucket.name)}`)
    }
  }
}