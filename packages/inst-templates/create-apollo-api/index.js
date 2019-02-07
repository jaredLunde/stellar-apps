const expressApi = require('@stellar-apps/create-express-api')
const instUtils = require('@stellar-apps/inst-utils')

module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = expressApi.prompts

module.exports.copy = async function ({PKG_DIR}) {
  const pkgLib = await instUtils.getPkgLib('@stellar-apps/create-express-api')
  await instUtils.copy(pkgLib, PKG_DIR,  {})
}

// package.json dependencies
module.exports.dependencies = {
  ...expressApi.dependencies,
  "apollo-server": "^2.4.0",
  "apollo-server-express": "^2.4.0",
  "graphql": "^14.1.1",
  "graphql-fields": "^2.0.1",
}

// package.json dev dependencies
module.exports.devDependencies = {
  ...expressApi.devDependencies,
  "graphql-tag.macro": "^2.1.0"
}

// package.json peer dependencies
module.exports.peerDependencies = expressApi.peerDependencies
module.exports.rename = expressApi.rename

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = expressApi.editPackageJson