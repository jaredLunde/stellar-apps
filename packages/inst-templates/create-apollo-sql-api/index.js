const expressApi = require('@stellar-apps/create-apollo-api')
const instUtils = require('@stellar-apps/inst-utils')

module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = expressApi.prompts

module.exports.copy = async function ({PKG_DIR}) {
  const pkgLib = await instUtils.getPkgLib('@stellar-apps/create-apollo-api')
  await instUtils.copy(pkgLib, PKG_DIR,  {})
}

// package.json dependencies
module.exports.dependencies = {
  ...expressApi.dependencies,
  "@lunde-cloud/create-migration": "^1.0.4",
  "connect-redis": "^3.4.1",
  "crypto-random-string": "^3.0.0",
  "db-errors": "^0.2.3",
  "express-session": "^1.16.2",
  "gripe": "^1.0.3",
  "knex": "^0.17.6",
  "objection": "^1.6.9",
  "objection-db-errors": "^1.1.1",
  "passport": "^0.4.0",
  "pg": "^7.11.0",
  "random-int": "^2.0.0",
  "safe-compare": "^1.1.4",
  "validator": "^11.0.0"
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