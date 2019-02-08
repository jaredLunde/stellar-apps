const path = require('path')
const paths = require('./paths')
const webpack = require('webpack')
const {createDevelopment, createProduction} = require('@stellar-apps/webpack')
const WebpackRimrafPlugin = require('@stellar-apps/webpack-rimraf-plugin')
// const nodeExternals = require('webpack-node-externals')

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
const stage = process.env.STAGE || 'development'
const createConfig = isDev ? createDevelopment : createProduction
const createAliases = ps =>
  ps.reduce((a, p) => ({...a, [`~${path.basename(path.dirname(p))}`]: p}), {})
let envConfig

if (isDev || stage === 'development') {
  envConfig = {
    target: 'node',
    devtool: isDev ? 'eval' : false
  }
}
else {
  envConfig = {
    target: 'lambda',
    plugins: [
      new WebpackRimrafPlugin()
    ]
  }
}

module.exports = createConfig(
  {
    name: 'api',
    rootImportSrc: paths.src,

    output: {
      path: path.join(paths.dist, stage),
      filename: 'handler.js',
      libraryTarget: 'commonjs2'
    },

    externals: [
      'encoding',
      'express',
      'aws-sdk',
      'apollo-server-express',
      // nodeExternals()
    ],

    resolveLoader: {
      modules: [paths.modules]
    },

    resolve: {
      modules: [paths.modules],
      alias: createAliases(paths.inherits)
    },

    babelOverride: {
      include: [paths.src, ...paths.inherits]
    },

    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
      new webpack.DefinePlugin({__DEV__: JSON.stringify(isDev)})
    ]
  },
  envConfig
)