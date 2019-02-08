const {flag, required, trim} = require('@inst-pkg/template-utils')

module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, // default template variables 
  packageJson,                              // contents of the package.json file as a plain object
  args,                                     // the arguments passed to the CLI
  inquirer                                  // the inquirer prompt object
) => ([
  // See https://github.com/SBoudrias/Inquirer.js#objects
  // for valid prompts
])

// package.json dependencies
module.exports.dependencies = {
}

// package.json dev dependencies
module.exports.devDependencies = {
}

// package.json peer dependencies
module.exports.peerDependencies = {
}


// filter for renaming files
module.exports.rename = function rename (filename) {
  return filename.endsWith('gitignore') && !filename.endsWith('.gitignore')
    ? filename.replace('gitignore', '.gitignore')
    : filename
}

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = function editPackageJson (
  packageJson, 
  variables /*from prompts() above*/
) {
  packageJson.scripts = {}
  
  // this function must return a valid package.json object
  return packageJson
}