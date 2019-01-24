const path = require('path')
const ora = require('ora')
const cmd = require('node-cmd')
const {getPackages} = require('./utils')
const argv = require('minimist')(process.argv.slice(2))


async function buildAll () {
  const ignore = argv.ignore ? new RegExp(argv.ignore) : /babel-presets/

  for (let pkg of getPackages(ignore)) {
    const spinner = ora(`Building ${path.basename(pkg)}`).start()

    await new Promise(
      (resolve, reject) => cmd.get(
        `
          cd ${pkg}
          yarn build ${pkg.includes('babel-presets') ? 'patch' : ''}
        `,
        (err, data, stderr) => {
          spinner.stop()

          if (!err) {
            resolve(data)
          } else {
            reject(err)
          }
        }
      )
    )
  }
}

buildAll().then(() => console.log('Finished.'))
