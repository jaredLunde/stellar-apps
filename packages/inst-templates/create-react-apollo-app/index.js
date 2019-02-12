const {flag, required, trim} = require('@inst-pkg/template-utils')
const reactApp = require('@stellar-apps/create-react-router-app')
const instUtils = require('@stellar-apps/inst-utils')

module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, /*default template variables*/
  packageJson,                              /*contents of the package.json file as a plain object*/
  args,
  inquirer
) => {
  const initialPrompts =
    reactApp.prompts(
      {
        ROOT_NAME,
        ROOT_DIR,
        PKG_NAME,
        PKG_DIR
      },
      packageJson,
      args,
      inquirer
    )

  return [
    ...initialPrompts.slice(0, -1),
    {
      name: 'APOLLO_DOMAIN_PRODUCTION',
      message: `Apollo domain [${flag('production', 'green')}]:`,
      filter: trim,
      validate: required
    },
    {
      name: 'APOLLO_DOMAIN_STAGING',
      message: `Apollo domain    [${flag('staging', 'white')}]:`,
      filter: trim,
      default: a =>
        a.APOLLO_DOMAIN_PRODUCTION.split('.').length > 2
          ? `staging-${a.APOLLO_DOMAIN_PRODUCTION}`
          : `staging.${a.APOLLO_DOMAIN_PRODUCTION}`,
      validate: required
    },
    ...initialPrompts.slice(-1)
  ]
}

module.exports.copy = async function ({PKG_DIR}) {
  await reactApp.copy({PKG_DIR})
  // copies lib from router app
  await instUtils.copy(
    await instUtils.getPkgLib('@stellar-apps/create-react-router-app'),
    PKG_DIR,
    {}
  )
}

// package.json dependencies
module.exports.dependencies = {
  ...reactApp.dependencies,
  "@stellar-apps/apollo": "^2.0.1",
  "apollo-boost": "^0.1.27",
  "apollo-link-context": "^1.0.14",
  "apollo-link-logger": "^1.2.3",
  "graphql": "^14.1.1",
  "graphql-tag.macro": "^2.1.0",
  "js-cookie": "^2.2.0",
  "node-fetch": "^2.3.0",
  "react-apollo": "^2.4.1",
  "set-cookie-parser": "^2.3.5",
  "unfetch": "^4.0.1"
}

// package.json dev dependencies
module.exports.devDependencies = reactApp.devDependencies

// package.json peer dependencies
module.exports.peerDependencies = reactApp.peerDependencies

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = reactApp.editPackageJson