// const {flag, required, trim, getPkgJson} = require('@inst-pkg/template-utils')
// const os = require('os')
// const path = require('path')
const instUtils = require('@stellar-apps/inst-utils')
const reactHook = require('@stellar-apps/create-react-hook')

module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, /*default template variables*/
  packageJson,                              /*contents of the package.json file as a plain object*/
  args,
  inquirer
) => {
  return []
}

module.exports.copy = async function ({PKG_DIR}) {
  // copies lib from router app
  await instUtils.copy(
    await instUtils.getPkgLib('@stellar-apps/create-react-hook'),
    PKG_DIR,
    {exclude: fn => fn.endsWith('index.ts')}
  )
}

// package.json dependencies
module.exports.dependencies = {
}

// package.json dev dependencies
module.exports.devDependencies = reactHook.devDependencies

// package.json peer dependencies
module.exports.peerDependencies = {}

module.exports.rename = reactHook.rename

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = function editPackageJson (
  {main, ...packageJson},
  variables /*from prompts() above*/
) {
  return {
    ...reactHook.editPackageJson(packageJson, variables),
    "keywords": [
      "react",
      "react component",
      variables.PKG_NAME.replace('-', ' ')
    ]
  }
}