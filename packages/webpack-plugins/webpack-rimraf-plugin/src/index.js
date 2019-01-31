import rimraf from 'rimraf'


module.exports = class WebpackRimrafPlugin {
  apply (compiler) {
    compiler.hooks.emit.tapAsync(
      'WebpackRimrafPlugin',
      (_, resolve) => rimraf(compiler.options.output.path, resolve)
    )
  }
}