const {createDevelopment, createProduction} = require('@stellar-apps/webpack')
const webpack = require('webpack')
const {StatsWriterPlugin} = require('webpack-stats-plugin')
const path = require('path')
const defaults = require('./default.config')
const paths = require('./paths')


const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
const stage = process.env.STAGE || 'development'
const createConfig = isDev ? createDevelopment : createProduction
const analyzeBundle = process.env.ANALYZE === 'true'
let envConfig

if (isDev) {
  // Development mode config
  envConfig = {
    devtool: 'eval',
    output: {
      globalObject: 'this',
      filename: `js/[name].js`,
      chunkFilename: `js/[name].js`
    },
    node: {
      querystring: true,
    }
  }
}
else {
  // Production mode config
  const TerserPlugin = require('terser-webpack-plugin')
  const CompressionPlugin = require('compression-webpack-plugin')
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  const zlib = require('zlib')

  envConfig = {
    plugins: [
      new webpack.LoaderOptionsPlugin({minimize: false, debug: false}),
      analyzeBundle ? new BundleAnalyzerPlugin() : () => {},
      analyzeBundle ? () => {} : new CompressionPlugin({
        test: /\.(js|txt|html|json|md|svg|xml|yml)(\?.*)?$/i,
        cache: true,
        algorithm: 'gzip',
        threshold: 1024,
        filename: '[path]',
        compressionOptions: {
          level: zlib.Z_BEST_COMPRESSION,
          memLevel: zlib.Z_BEST_COMPRESSION,
        }
      }),
      new StatsWriterPlugin({fields: ['publicPath', 'chunks']})
    ],

    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: 4,
          terserOptions: {
            compress: {
              passes: 2,
              keep_infinity: true,
              drop_console: false,
              pure_getters: 'strict',
              toplevel: true,
              unsafe_comps: true,
              unsafe_Function: true,
              unsafe_math: true,
              unsafe_proto: true,
              unsafe_undefined: true,
              warnings: false,
              ecma: 5,
              dead_code: true
            },
            output: {
              comments: false
            },
            sourceMap: false
          }
        })
      ],

      splitChunks: {
        chunks: 'async',
        minSize: 30 * 1000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        name: true,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
          commons: {
            name: 'commons',
            chunks: 'initial',
            minChunks: 2,
          },
        },
      },
    }
  }
}

module.exports = createConfig(
  defaults,
  {
    name: 'client',
    entry: [path.join(paths.src, 'client.js')],
    output: {
      path: path.join(paths.dist, stage, 'client'),
      filename: `js/[hash].js`,
      chunkFilename: `js/[contenthash].js`
    },

    plugins: [
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(isDev),
        __SERVER__: JSON.stringify(false),
        __CLIENT__: JSON.stringify(true),
        __STAGE__: JSON.stringify(stage)
      })
    ]
  },
  envConfig
)