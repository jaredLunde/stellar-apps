const path = require('path')
const ora = require('ora')
const cmd = require('node-cmd')
const chalk = require('chalk')
const {getPackages} = require('./utils')
const argv = require('minimist')(process.argv.slice(2))


async function buildAll () {
  const ignore = argv.ignore ? new RegExp(argv.ignore) : /babel-presets|create-preset/

  for (let pkg of getPackages(ignore)) {
    const pkgName = path.basename(pkg)
    const spinner = ora(`Building ${pkgName}`).start()

    await new Promise(
      (resolve, reject) => cmd.get(
        `
          cd ${pkg}
          yarn build ${pkg.includes('babel-presets') ? 'patch' : ''}
        `,
        (err, data, stderr) => {
          spinner.succeed(`Built ${chalk.bold(pkgName)}`)

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
