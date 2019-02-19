const path = require('path')
const paths = require('./paths')
const Dotenv = require('dotenv-webpack')
const ImageminPlugin = require("imagemin-webpack")
const imageminMozJpeg = require("imagemin-mozjpeg")
const imageminOptipng = require("imagemin-optipng")
const WebpackRimrafPlugin = require('@stellar-apps/webpack-rimraf-plugin')


const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
const stage = process.env.STAGE || 'development'
const createAliases = ps =>
  ps.reduce((a, p) => ({...a, [`~${path.basename(path.dirname(p))}`]: p}), {})

module.exports = {
  rootImportSrc: paths.src,

  output: {
    publicPath: process.env.PUBLIC_PATH || '/public/'
  },

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

  module: {
    rules: [
      {
        test: /\.(jpe?g|png|webp)$/i,
        loader: 'responsive-loader',
        options: {
          name: '[folder]/[hash]/[name]-[width]x[height].[ext]',
          adapter: require('responsive-loader/sharp')
        }
      }
    ],
  },

  plugins: [
    new WebpackRimrafPlugin(),
    // dotenv-webpack wraps dotenv and Webpack.DefinePlugin. As such, it does a text replace in
    // the resulting bundle for any instances of process.env
    //
    // dotenv-webpack will only expose environment variables that are explicitly referenced in
    // your code to your final bundle
    new Dotenv({
      // loads the dotenv based on the stage rather than node environment because configs
      // are stage-specific rather that node_env-specific
      path: paths.join(`.env.${stage}`),
      // loads all the predefined 'process.env' variables which will trump anything local per
      // dotenv specs
      systemvars: true
    }),
    new ImageminPlugin({
      bail: false,
      cache: true,
      loader: false,
      maxConcurrency: 8,
      imageminOptions: {
        plugins: [
          imageminMozJpeg({quality: isDev ? 70 : 90, progressive: true}),
          imageminOptipng({optimizationLevel: isDev ? 1 : 7})
        ]
      }
    })
  ]
}
