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
    devtool: isDev ? 'eval' : false
  }
}
else {
  const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin')
  const CompressionPlugin = require('compression-webpack-plugin')
  const zlib = require('zlib')

  envConfig = {
    plugins: [
      new StaticSiteGeneratorPlugin({
        crawl: true,
        locals: {
          // Properties here are merged into `locals`
          // passed to the exported render function
        }
      }),
      new CompressionPlugin({
        test: /\.(txt|html|json|md|xml|yml)(\?.*)?$/i,
        cache: true,
        algorithm: 'gzip',
        threshold: 1024,
        filename: '[path]',
        compressionOptions: {
          level: zlib.Z_BEST_COMPRESSION,
          memLevel: zlib.Z_BEST_COMPRESSION,
        }
      })
    ]
  }
}

module.exports = createConfig(
  defaults,
  {
    name: 'server',
    target: 'node',

    entry: [path.join(paths.src, 'server.js')],

    output: {
      path: path.join(paths.dist, stage, 'server'),
      filename: 'render.js',
      libraryTarget: 'commonjs2'
    },

    externals: [
      'js-beautify',
      'encoding'
    ],

    module: {
      rules: [
        {
          test: /robots(.disallow)?.txt$/,
          use: [{
            loader: 'file',
            options: {
              name: 'robots.txt'
            }
          }]
        },
        {
          test: /\.html/,
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

