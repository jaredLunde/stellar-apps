const {createDevelopment, createProduction} = require('@stellar-apps/webpack')
const path = require('path')
const webpack = require('webpack')
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin')
// const nodeExternals = require('webpack-node-externals')
const defaults = require('./default.config')
const paths = require('./paths')


const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
const stage = process.env.STAGE || 'development'
const createConfig = isDev ? createDevelopment : createProduction
let envConfig

if (isDev) {
  envConfig = {
    target: 'node',
    devtool: 'eval'
  }
}

module.exports = createConfig(
  defaults,
  {
    name: 'server',
    target: 'lambda',
    rootImportSrc: paths.appSrc,

    entry: [path.join(paths.serverSrc, 'render.js')],

    output: {
      path: path.join(paths.dist, stage, 'server'),
      filename: 'render.js',
      libraryTarget: 'commonjs2'
    },

    externals: [
      // nodeExternals({modulesDir: '../../../node_modules', whitelist: [/web/,]})
      /js-beautify/
    ],

    module: {
      rules: [
        {
          test: /\.html|\.txt|\.tpl/,
          loaders: ['raw']
        }
      ]
    },

    plugins: [
      new IgnoreEmitPlugin(/\.(woff|woff2|ttf|eot|png|jpe?g|gif|ico|otf|mp4)$/),
      new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
      new webpack.DefinePlugin({
        __STAGE__: stage,
        __SERVER__: JSON.stringify(true),
        __CLIENT__: JSON.stringify(false),
        __DEV__: JSON.stringify(isDev)
      })
    ],

    optimization: {minimize: false}
  },
  envConfig
)

