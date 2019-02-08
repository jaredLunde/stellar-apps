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

if (isDev || stage === 'development') {
  envConfig = {
    target: 'node',
    devtool: isDev ? 'eval' : false
  }
}

module.exports = createConfig(
  defaults,
  {
    name: 'server',
    target: 'lambda',

    entry: [path.join(paths.src, 'server.js')],

    output: {
      path: path.join(paths.dist, stage, 'server'),
      filename: 'render.js',
      libraryTarget: 'commonjs2'
    },

    externals: [
      // nodeExternals({modulesDir: '../../../node_modules', whitelist: [/web/,]})
      'js-beautify',
      'encoding'
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
        __DEV__: JSON.stringify(isDev),
        __SERVER__: JSON.stringify(false),
        __CLIENT__: JSON.stringify(true),
      })
    ]
  },
  envConfig
)

