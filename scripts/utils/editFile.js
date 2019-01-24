const getPackages = require('./getPackages')
const fs = require('fs')
const {promisify} = require('util')
const path = require('path')


const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const rename = promisify(fs.rename)

function editFile (filename, find, replace, opt = {}) {
  const {ignore, dry = false} = opt
  return Promise.all(
    getPackages(ignore).map(
      async dir => {
        const source = path.join(dir, filename)

        if (fs.existsSync(source) === false) {
          return
        }

        const tmpSource = `${source}.tmp`
        const data = await readFile(source, 'utf8')

        if (dry) {
          console.log(
            `[Dry]\n`,
            data,
            '------------------------------------------------------------------',
            data.replace(new RegExp(find, 'g'), replace),
            '__________________________________________________________________\n\n',
          )
        }

        return writeFile(
          tmpSource,
          data.replace(new RegExp(find, 'g'), replace)
        ).then(
          () => rename(tmpSource, source)
        )
      }
    )
  )
}

module.exports = editFile