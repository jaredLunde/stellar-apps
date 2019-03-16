const createPreset = require('../../create-preset')
const assign = createPreset.assign


const dependencies = {}
dependencies.development = {
  "@babel/preset-react": {
    version: '^7.0.0',
    isBabelPreset: true,
  }
}

dependencies.production = Object.assign({}, dependencies.development, {
  "@babel/plugin-transform-react-constant-elements": {
    version: '^7.2.0',
    isBabelPlugin: true,
    isOptional: 'transformConstant'
  },
  "babel-plugin-transform-react-remove-prop-types": {
    version: "^0.4.23",
    isBabelPlugin: true,
    isOptional: 'removePropTypes'
  },
  "babel-plugin-transform-react-pure-class-to-function": {
    version: "^1.0.1",
    isBabelPlugin: true,
    isOptional: 'transformPure'
  }
})


createPreset.run(dependencies)
