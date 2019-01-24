const shell = require('shelljs')
const path = require('path')


module.exports = ignore => {
  return (
    shell.find(path.join(__dirname, '../../packages'))
      .filter(
        function (source) {
          if (ignore) {
            if (typeof ignore === 'function') {
              if (ignore(source) === true) {
                return false
              }
            }
            else {
              if (ignore.test(source) === true) {
                return false
              }
            }
          }

          return (
            !(source.indexOf('node_modules') > -1 || source[0] === '.')
            && path.basename(source) === 'package.json'
          )
        }
      )
      .map(
        source => path.dirname(source)
      )
  )
}
