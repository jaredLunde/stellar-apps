const createPreset = require('../../create-preset')
const assign = createPreset.assign
const deepAssign = createPreset.deepAssign
const extendProd = createPreset.extendProd


const dependencies = {}
dependencies.development = {
  "@stellar-apps/babel-preset-es": {
    version: "^1.0.0",
    isBabelPreset: true,
    options: deepAssign(
      {
        env: {
          "useBuiltIns": "usage",
          "loose": true,
          "modules": false
        },
        "runtime": {corejs: 2}
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
    options: assign({"sourceMap": true}, 'emotion'),
    isOptional: 'emotion'
  },
  "babel-plugin-polished": {
    "version": "^1.1.0",
    isBabelPlugin: true,
    isOptional: 'polished'
  }
}

extendProd(dependencies, {
  "@emotion/babel-preset-css-prop": {
    options: assign({"sourceMap": false, "hoist": true}, 'emotion')
  }
})


createPreset.run(dependencies)
