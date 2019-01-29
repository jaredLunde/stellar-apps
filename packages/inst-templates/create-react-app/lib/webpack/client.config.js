const {createDevelopment, createProduction} = require('@stellar-apps/webpack')
const webpack = require('webpack')
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
    output: {
      globalObject: 'this'
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
        minRatio: 0.67,
        filename: '[path]',
        compressionOptions: {
          level: zlib.Z_BEST_COMPRESSION,
          memLevel: zlib.Z_BEST_COMPRESSION,
        }
      })
    ],

    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          terserOptions: {
            compress: {
              passes: 2,
              keep_infinity: true,
              drop_console: false,
              pure_getters: 'strict',
              toplevel: true,
              unsafe: true,
              unsafe_comps: true,
              unsafe_Function: true,
              unsafe_math: true,
              unsafe_proto: true,
              unsafe_regexp: true,
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
        cacheGroups: {
          default: {
            name: 'default',
            chunks: 'initial',
            minSize: 96 * 1000,
            maxSize: 156 * 1000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 5,
            priority: -10,
            reuseExistingChunk: true,
          },

          icons: {
            name: 'icons',
            chunks: 'all',
            enforce: true,
            priority: 10,
            reuseExistingChunk: true,
            test: function(module) {
              return module.resource && module.resource.includes('\/icons\/')
            },
          }
        },
      }
    }
  }
}

module.exports = createConfig(
  defaults,
  {
    name: 'client',

    entry: [path.join(paths.clientSrc, 'render.js')],

    output: {
      path: path.join(paths.dist, stage, 'client'),
      filename: `js/client.[hash].js`,
      chunkFilename: `js/client.[chunkhash].js`
    },

    plugins: [
      new webpack.DefinePlugin({
        __STAGE__: stage,
        __DEV__: JSON.stringify(isDev),
        __SERVER__: JSON.stringify(false),
        __CLIENT__: JSON.stringify(true),
      })
    ]
  },
  envConfig
)
