const path = require('path')
const paths = require('./paths')
const ImageminPlugin = require("imagemin-webpack")
const imageminMozJpeg = require("imagemin-mozjpeg")
const imageminOptipng = require("imagemin-optipng")


const createAliases = is =>
  is.reduce((o, i) => ({...o, [`~${path.basename(path.dirname(i))}`]: i}), {})

module.exports = {
  rootImportSrc: paths.appSrc,

  output: {
    publicPath: process.env.CONFIG__PUBLIC_PATH || '/public/'
  },

  resolveLoader: {
    modules: [paths.modules]
  },

  resolve: {
    modules: [paths.modules],
    alias: createAliases(paths.inherits)
  },

  babelOverride: {
    include: [paths.appSrc, ...paths.inherits, paths.clientSrc, paths.serverSrc]
  },

  module: {
    rules: [
      {
        test: /\.(jpe?g|png)$/i,
        loader: 'responsive-loader',
        options: {
          name: '[folder]/[hash]/[name]-[width]x[height].[ext]',
          adapter: require('responsive-loader/sharp')
        }
      }
    ],
  },

  plugins: [
    new ImageminPlugin({
      bail: false,
      cache: true,
      loader: false,
      maxConcurrency: 4,
      imageminOptions: {
        plugins: [
          imageminMozJpeg({quality: 90, progressive: true}),
          imageminOptipng({optimizationLevel: 7})
        ]
      }
    })
  ]
}
