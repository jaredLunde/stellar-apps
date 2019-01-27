import webpack from 'webpack'
import merge from 'webpack-merge'
import path from 'path'


const absoluteRuntime = path.dirname(
  require.resolve('@babel/runtime-corejs2/package.json')
)

function getBabelDefaultsWithPresets (presets, {include, exclude}) {
  const isProd = process.env.NODE_ENV === 'production'

  return [
    // Internal dependencies
    {
      test: /(\.js|\.jsx)$/,
      use: {
        loader: 'babel',
        options: {
          presets,
          cacheCompression: isProd,
          compact: isProd,
          cacheDirectory: true,
          babelrc: false,
          configFile: false
        }
      },
      include: include,
      exclude: (
        include && include.length
          ? void 0
          : (exclude || /(node_modules|bower_components)/)
      )
    }
  ]
}

function getBabelForWeb (target, babelOverride) {
  const isProd = process.env.NODE_ENV === 'production'
  const presets = [
    [
      '@stellar-apps/react-app',
      {
        es: {
          runtime: {absoluteRuntime}
        }
      }
    ]
  ]

  return [
    ...getBabelDefaultsWithPresets(presets, babelOverride),
    // External dependencies
    {
      test: /\.(js|mjs)$/,
      exclude: /@babel(?:\/|\\{1,2})runtime|core-js|warning/,
      loader: 'babel',
      options: {
        presets,
        sourceType: 'unambiguous',
        cacheCompression: isProd,
        cacheDirectory: true,
        sourceMaps: false,
        compact: false,
        babelrc: false,
        configFile: false
      }
    }
  ]
}

function getBabelForNode (target, babelOverride) {
  const isProd = process.env.NODE_ENV === 'production'
  const presets = [
    [
      '@stellar-apps/react-app',
      {
        env: {
          targets: target === 'lambda' ? {'node': '8.10'} : {'node': 'current'}
        },
        es: {
          runtime: {absoluteRuntime}
        }
      }
    ]
  ]

  return [
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    },
    ...getBabelDefaultsWithPresets(presets, babelOverride)
  ]
}

function defaultGetBabelRules (target, babelOverride) {
  return target === 'node' || target === 'lambda'
    ? getBabelForNode(target, babelOverride)
    : getBabelForWeb(target, babelOverride)
}

export default function createConfig (...configs) {
  let {
    target = 'web',
    rootImportSrc,
    babelOverride = {},
    getBabelRules = defaultGetBabelRules,
    ...config
  } = merge.smartStrategy({'module.rules': 'prepend'})(...configs)

  if (rootImportSrc === void 0) {
    throw new Error(`Must define 'config.rootImportSrc' in your development config for: ${config.name}`)
  }

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
          },
          ...getBabelRules(target, babelOverride)
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
