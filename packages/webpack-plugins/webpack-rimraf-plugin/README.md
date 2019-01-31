# @stellar-apps/webpack-rimraf-plugin
Does one thing and one thing only - rimraf's the `output.path` defined in your Webpack 
configuration. There are no, options, nothing special to know. I just didn't want to have
to define the output path in multiple locations. Simple as that.

## Installation
`yarn add @stellar-apps/webpack-rimraf-plugin`

## Usage
```js
const WebpackRimrafPlugin = require('@stellar-apps/webpack-rimraf-plugin')

module.exports = {
  output: {
    // this will get nuked before Webpack assets emit
    path: path.resolve(__dirname, 'dist/server')
  },
  plugins: [
    new WebpackRimrafPlugin()
  ]
}
```