const {flag, required, trim} = require('@inst-pkg/template-utils')
const staticReactApp = require('@stellar-apps/create-static-react-app')
const reactApp = require('@stellar-apps/create-react-router-app')
const instUtils = require('@stellar-apps/inst-utils')

module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = staticReactApp.prompts

module.exports.copy = async function ({PKG_DIR}) {
  await staticReactApp.copy({PKG_DIR})
  // copies lib from static app
  await instUtils.copy(
    await instUtils.getPkgLib('@stellar-apps/create-static-react-app'),
    PKG_DIR,
    {}
  )
  // copies lib from router app
  await instUtils.copy(
    await instUtils.getPkgLib('@stellar-apps/create-react-router-app'),
    PKG_DIR,
    {}
  )
}

// package.json dependencies
module.exports.dependencies = {
  ...staticReactApp.dependencies,
  ...reactApp.dependencies
}
delete module.exports.dependencies['serverless-http']

// package.json dev dependencies
module.exports.devDependencies = staticReactApp.devDependencies

// package.json peer dependencies
module.exports.peerDependencies = staticReactApp.peerDependencies
module.exports.rename = staticReactApp.rename

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = staticReactApp.editPackageJson