const {flag, required, trim, getPkgJson, autocompleteIni} = require('@inst-pkg/template-utils')
const reactApp = require('@stellar-apps/create-react-app')
const instUtils = require('@stellar-apps/inst-utils')
const os = require('os')
const path = require('path')


module.exports = {}
const CREDENTIALS_FILE = path.join(os.homedir(), '.aws/credentials')

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, /*default template variables*/
  packageJson,                              /*contents of the package.json file as a plain object*/
  args,
  inquirer
) => {
  const prompts = [
    // See https://github.com/SBoudrias/Inquirer.js#objects
    // for valid prompts
    autocompleteIni(inquirer, CREDENTIALS_FILE, {
      name: 'AWS_PROFILE',
      message: `AWS profile                    :`,
      filter: trim,
      validate: required
    }),

    {
      name: 'DOMAIN_PRODUCTION',
      message: `Domain name        [${flag('production', 'green')}]:`,
      filter: trim,
      validate: required
    },

    {
      name: 'SITE_S3_BUCKET_PRODUCTION',
      message: `Website S3 bucket  [${flag('production', 'green')}]:`,
      default: a => a.DOMAIN_PRODUCTION,
      filter: trim,
      validate: required
    },

    {
      name: 'CLIENT_S3_BUCKET_PRODUCTION',
      message: `Public S3 bucket   [${flag('production', 'green')}]:`,
      default: a => `${PKG_NAME}-public`,
      filter: trim,
      validate: required
    },

    {
      name: 'DOMAIN_STAGING',
      message: `Domain name           [${flag('staging', 'white')}]:`,
      default: a =>
        a.DOMAIN_PRODUCTION.split('.').length > 2
          ? `staging-${a.DOMAIN_PRODUCTION}`
          : `staging.${a.DOMAIN_PRODUCTION}`,
      filter: trim,
      validate: required
    },

    {
      name: 'SITE_S3_BUCKET_STAGING',
      message: `Website S3 bucket     [${flag('staging', 'white')}]:`,
      default: a => a.DOMAIN_STAGING,
      filter: trim,
      validate: required
    },

    {
      name: 'CLIENT_S3_BUCKET_STAGING',
      message: `Client S3 bucket      [${flag('staging', 'white')}]:`,
      default: a => `${a.CLIENT_S3_BUCKET_PRODUCTION.replace('-public', '-staging-public')}`,
      filter: trim,
      validate: required
    }
  ]

  let workspaces = getPkgJson(ROOT_DIR).workspaces
  workspaces = workspaces && workspaces.filter(ws => PKG_DIR !== path.join(ROOT_DIR, ws))
  if (workspaces.length > 0) {
    prompts.push({
      name: 'INHERITS',
      message: `Inherits code from`,
      type: 'checkbox',
      choices: workspaces
        .filter(ws => PKG_DIR !== path.join(ROOT_DIR, ws))
        .map(ws => path.relative(PKG_DIR, path.join(ROOT_DIR, ws)))
    })
  }

  return prompts
}

// copies assets from create-react-app for improved code-sharing
module.exports.copy = async function ({PKG_DIR}) {
  const pkgLib = await instUtils.getPkgLib('@stellar-apps/create-react-app')
  await instUtils.copy(
    pkgLib,
    PKG_DIR,
    {
      exclude: source => source.endsWith('lib/render.js')
    }
  )
}

// package.json dependencies
module.exports.dependencies = {...reactApp.dependencies}
// these deps aren't needed for static sites
delete module.exports.dependencies['serverless-http']

// package.json dev dependencies
const devDependencies = {
  ...reactApp.devDependencies,
  "@stellar-apps/static-site-generator-plugin": "^1.0.0"
}
// these deps aren't needed for static sites
delete devDependencies['serverless-webpack']
delete devDependencies['serverless-apigw-binary']
delete devDependencies['serverless-plugin-lambda-warmup']
module.exports.devDependencies = devDependencies

// package.json peer dependencies
module.exports.peerDependencies = {}
module.exports.rename = reactApp.rename

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = function editPackageJson (
  packageJson,
  variables /*from prompts() above*/
) {
  packageJson = {
    ...packageJson,
    ...reactApp.editPackageJson(packageJson, variables),
  }
  packageJson.stellar = {
    type: 'serverless-static-app'
  }
  // this function must return a valid package.json object
  return packageJson
}