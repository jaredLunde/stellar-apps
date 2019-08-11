const createPreset = require('../../create-preset')
const assign = createPreset.assign


const dependencies = {}
dependencies.development = {
  "@babel/preset-react": {
    version: 'latest',
    isBabelPreset: true,
  }
}

dependencies.production = Object.assign({}, dependencies.development, {
  "@babel/plugin-transform-react-constant-elements": {
    version: 'latest',
    isBabelPlugin: true,
    isOptional: 'transformConstant'
  },
  "babel-plugin-transform-react-remove-prop-types": {
    version: "latest",
    isBabelPlugin: true,
    isOptional: 'removePropTypes'
  },
  "babel-plugin-transform-react-pure-class-to-function": {
    version: "latest",
    isBabelPlugin: true,
    isOptional: 'transformPure'
  }
})


createPreset.run(dependencies)
