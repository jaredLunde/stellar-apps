import rimraf from 'rimraf'

class WebpackRimrafPlugin {
  apply (compiler) {
    compiler.hooks.emit.tapAsync(
      'WebpackRimrafPlugin',
      () => rimraf(compiler.options.output.path)
    );
  }
}