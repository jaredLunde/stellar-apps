import webpack from 'webpack'
import merge from 'webpack-merge'


export default function createConfig (...configs) {
  let {
    target = 'web',
    rootImportSrc,
    // this opt is here because webpack-merge doesn't understand
    // rule merging when 'include' or 'exclude' are defined :eyeroll:
    babelRules = {},
    babelPreset,
    ...config
  } = merge.smartStrategy({'module.rules': 'prepend'})(...configs)

  if (rootImportSrc === void 0) {
    throw new Error(`Must define 'config.rootImportSrc' in your development config for: ${config.name}`)
  }

  babelPreset = babelPreset || [
    '@stellar-apps/react-app',
    {
      es: {
        env: {
          targets: (
            target === 'node'
              ? {'node': 'current'}
              : target === 'lambda'
                ? {'node': '8.10'}
                : process.env.NODE_ENV === 'production'
                  ? {browsers: 'last 2 versions'}
                  : {ie: 11, chrome: 41}
          )
        }
      }
    }
  ]

  const mainFields =
    target === 'web'
    ? ['browser', 'module', 'jsnext', 'esnext', 'jsnext:main', 'main']
    : ['module', 'jsnext', 'esnext', 'jsnext:main', 'main']

  return merge.smartStrategy({
    'module.rules': 'prepend',
    'resolve.mainFields': 'replace'
  })(
    {
      target: target === 'lambda' ? 'node' : target,

      // The base directory for resolving the entry option
      output: {
        publicPath: '/public/',
        pathinfo: true
      },

      // Where to resolve our loaders
      resolveLoader: {
        modules: ['node_modules'],
        moduleExtensions: ['-loader'],
      },

      resolve: {
        // Directories that contain our modules
        symlinks: false,
        modules: ['node_modules'],
        mainFields,
        descriptionFiles: ['package.json'],
        // Extensions used to resolve modules
        extensions: ['.mjs', '.js', '.jsx'],
        alias: {
          '~': rootImportSrc,
          'node-fetch$': "node-fetch/lib/index.js"
        },
      },

      module: {
        rules: [
          {
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto',
          },
          {
            type: 'javascript/auto',
            test: /public\/.*\.(json|js)$/,
            use: [
              {
                loader: 'file',
                options: {
                  regExp: /public\/([\w\/\-\.]+)\.(json|js)$/,
                  name: '[1].[hash].[ext]'
                }
              }
            ],
            exclude: /(node_modules|bower_components)/
            // include: stellar.include,
            // exclude: (
            //   stellar.include && stellar.include.length
            //     ? void 0
            //     : (stellar.exclude || /(node_modules|bower_components)/)
            // )
          },
          {
            test: /public(?:(?!\/json\/))\/.*$/,
            use: [
              {
                loader: 'file',
                options: {
                  regExp: /public\/(.*)\.([^.]+)$/,
                  name: '[1].[hash].[ext]'
                }
              }
            ],
            exclude: /(node_modules|bower_components)/
            //include: stellar.include,
            //exclude: (
            //  stellar.include && stellar.include.length
            //    ? void 0
            //    : (stellar.exclude || /(node_modules|bower_components)/)
            //)
          },
          {
            test: /(\.js|\.jsx)$/,
            use: {
              loader: 'babel',
              options: {
                babelrc: false,
                configFile: false,
                cacheDirectory: true,
                cacheCompression: process.env.NODE_ENV === 'production',
                compact: process.env.NODE_ENV === 'production',
                ignoreBrowserslistConfig: true,
                presets: [babelPreset]
              }
            },
            ...babelRules,
            include: babelRules.include,
            exclude: (
              babelRules.include && babelRules.include.length
                ? void 0
                : (babelRules.exclude || /(node_modules|bower_components)/)
            )
          }
        ]
      },

      // Include mocks for when node.js specific modules may be required
      node: {
        fs: 'empty',
        vm: 'empty',
        net: 'empty',
        tls: 'empty',
        url: 'empty',
        path: 'empty',
        querystring: 'empty',
        process: true
      }
    },
    config
  )
}
