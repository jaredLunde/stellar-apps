const reactApp = require('@stellar-apps/create-react-app')
const instUtils = require('@stellar-apps/inst-utils')

module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = reactApp.prompts

module.exports.copy = async function ({PKG_DIR}) {
  const pkgLib = await instUtils.getPkgLib('@stellar-apps/create-react-app')
  await instUtils.copy(pkgLib, PKG_DIR,  {})
}

// package.json dependencies
module.exports.dependencies = {
  ...reactApp.dependencies,
  "resolve-url": "^0.2.1",
  "react-router-dom": "^4.3.1",
  "@jaredlunde/curls-addons": "^4.0.3",
  "@stellar-apps/min-height-hero": "^2.0.2"
}

// package.json dev dependencies
module.exports.devDependencies = reactApp.devDependencies

// package.json peer dependencies
module.exports.peerDependencies = reactApp.peerDependencies
module.exports.rename = reactApp.rename

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = reactApp.editPackageJson