const path = require('path')
const chalk = require('chalk')
const {editFile} = require('./utils')
const argv = require('minimist')(process.argv.slice(2))


async function editAll () {
  const [filename, find, replace] = argv._

  if (!filename) {
    console.log(chalk.red('Error'), 'you must include a filename.')
  }

  if (!find) {
    console.log(chalk.red('Error'), 'you must include a second argument for `find`')
  }

  if (!replace) {
    console.log(chalk.red('Error'), 'you must include a second argument for `replace`')
  }

  const ignore = argv.ignore ? new RegExp(argv.ignore) : void 0
  await editFile(filename, find, replace, {ignore, dry: argv.dry !== void 0})
}

editAll()
