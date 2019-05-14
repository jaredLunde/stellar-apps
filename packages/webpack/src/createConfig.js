import merge from 'webpack-merge'
import babelMerge from 'babel-merge'
import path from 'path'


const absoluteRuntime = path.dirname(
  require.resolve('@babel/runtime-corejs3/package.json')
)

function mergeBabelConfig (base, {presets, plugins}) {
  return babelMerge(base, {presets, plugins})
}

function createBabelLoader ({test, presets, plugins, include, exclude, options}) {
  const isProd = process.env.NODE_ENV === 'production'
  
  return {
    test: test || /(\.js|\.jsx|\.mjs)$/,
    use: [
      'cache',
      {
        loader: 'babel',
        options: {
          presets,
          plugins,
          // only caches compressed files in prod
          cacheCompression: isProd,
          // only minifies in prod
          compact: isProd,
          // caches for better rebuild performance
          cacheDirectory: true,
          // ignores .babelrc in directories
          babelrc: false,
          // ignores config files in directories
          configFile: false,
          ...options
        }
      }
    ],
    include,
    exclude
  }
}

// Internal dependencies
function getInternalBabelLoader(defaultPresets, babelOverride = {}) {
  const {test, presets, plugins, include, exclude, options} = babelOverride

  return createBabelLoader({
    test,
    ...mergeBabelConfig({presets: defaultPresets}, {presets, plugins}),
    include,
    exclude: include ? void 0 : (exclude || /node_modules|bower_components/),
    options
  })
}

// External dependencies
function getExternalBabelLoader(defaultPresets, babelOverride = {}) {
  const {test, presets, plugins, include, exclude, options} = babelOverride

  return createBabelLoader({
    test,
    ...mergeBabelConfig({presets: defaultPresets}, {presets, plugins}),
    include,
    exclude: include ? void 0 : (exclude || /@babel(?:\/|\\{1,2})runtime|core-js|warning/),
    options: {
      ...options,
      // considers the file a "module" if import/export statements are present, or else
      // considers it a "script"
      sourceType: 'unambiguous',
      // doesn't generate source maps for perf reasons
      sourceMaps: false,
      // doesn't minify for perf reasons
      compact: false,
    }
  })
}

function getBabelLoadersForWeb (target, babelOverride) {
  const defaultPresets = [
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
    getInternalBabelLoader(defaultPresets, babelOverride.internal),
    getExternalBabelLoader(defaultPresets, babelOverride.external)
  ]
}

function getBabelLoadersForNode (target, babelOverride) {
  const defaultPresets = [
    [
      '@stellar-apps/react-app',
      {
        env: {
          targets: target === 'lambda'
            ? {'node': '10', browsers: void 0}
            : {'node': 'current', browsers: void 0}
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
    getInternalBabelLoader(defaultPresets, babelOverride.internal),
    getExternalBabelLoader(defaultPresets, babelOverride.external)
  ]
}

function getBabelLoaders (target, babelOverride) {
  return target === 'node' || target === 'lambda'
    ? getBabelLoadersForNode(target, babelOverride)
    : getBabelLoadersForWeb(target, babelOverride)
}

// sets up loader public files in /public/ directories
function getPublicLoader (publicLoader) {
  if (publicLoader === false) {
    return {}
  }

  const {
    // We expect these image types to be handled specially
    test = /public\/.*\.(?!(jpe?g|png|webm)$)([^.]+$)$/,
    use = [
      {
        loader: 'file',
        options: {
          regExp: /public\/(.*)\.([^.]+)$/,
          name: '[1]/[md4:hash:base62:12].[ext]'
        }
      }
    ],
    include,
    exclude = /node_modules|bower_components/,
  } = publicLoader || {}

  return {test, use, include, exclude: include ? void 0 : exclude,}
}

export default function createConfig (...configs) {
  let {
    target = 'web',
    rootImportSrc,
    babelOverride = {},
    publicLoader,
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
    'module.rules': 'append',
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
          getPublicLoader(publicLoader),
          ...getBabelLoaders(target, babelOverride)
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
