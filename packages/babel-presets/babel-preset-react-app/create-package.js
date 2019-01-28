const createPreset = require('../../create-preset')
const assign = createPreset.assign
const deepAssign = createPreset.deepAssign
const extendProd = createPreset.extendProd


const dependencies = {}
const envDefaults = {
  useBuiltIns: 'usage',
  loose: true,
  modules: false,
  ignoreBrowserslistConfig: true,
  exclude: ['transform-typeof-symbol'],
}

dependencies.development = {
  "@stellar-apps/babel-preset-es": {
    version: "^1.0.1",
    isBabelPreset: true,
    options: deepAssign(
      {
        env: {
          ...envDefaults,
          targets: {browsers: 'last 2 versions'},
        },
        runtime: {
          corejs: 2,
          helpers: false,
          useESModules: true
        }
      },
      'es'
    )
  },
  "@stellar-apps/babel-preset-react": {
    "version": "^1.0.0",
    isBabelPreset: true,
    options: assign({}, 'react')
  },
  "@emotion/babel-preset-css-prop": {
    "version": "^10.0.6",
    isBabelPreset: true,
    options: assign({"sourceMap": true, "autoLabel": true}, 'emotion'),
    isOptional: 'emotion'
  },
  "babel-plugin-polished": {
    "version": "^1.1.0",
    isBabelPlugin: true,
    isOptional: 'polished'
  }
}

extendProd(dependencies, {
  "@stellar-apps/babel-preset-es": {
    version: "^1.0.1",
    isBabelPreset: true,
    options: deepAssign(
      {
        env: {
          ...envDefaults,
          targets: {
            ie: 11,
            chrome: 41
          }
        },
        runtime: {
          corejs: 2,
          helpers: true,
          useESModules: true
        }
      },
      'es'
    )
  },
  "@emotion/babel-preset-css-prop": {
    options: assign({"sourceMap": false, "hoist": true, "autoLabel": false}, 'emotion')
  }
})


createPreset.run(dependencies)
