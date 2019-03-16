const {flag, required, trim, getPkgJson, autocompleteIni} = require('@inst-pkg/template-utils')
const path = require('path')
const os = require('os')


module.exports = {}
const CREDENTIALS_FILE = path.join(os.homedir(), '.aws/credentials')

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR},
  packageJson,
  args,
  inquirer
) => {
  const prompts = [
    autocompleteIni(inquirer, CREDENTIALS_FILE, {
      name: 'AWS_PROFILE',
      message: `AWS profile              :`,
      default: `${PKG_NAME}-dev`,
      filter: trim,
      validate: required,
    }),

    {
      name: 'DOMAIN_PRODUCTION',
      message: `Domain name  [${flag('production', 'green')}]:`,
      filter: trim,
      validate: required
    },

    {
      name: 'DOMAIN_STAGING',
      message: `Domain name     [${flag('staging', 'white')}]:`,
      default: a =>
        a.DOMAIN_PRODUCTION.split('.').length > 2
          ? `staging-${a.DOMAIN_PRODUCTION}`
          : `staging.${a.DOMAIN_PRODUCTION}`,
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

// package.json dependencies
module.exports.dependencies = {
  "@babel/runtime": "^7.3.1",
  "@babel/runtime-corejs2": "^7.3.1",
  "aws-sdk": "^2.382.0",
  "change-case": "^3.0.2",
  "cookie-parser": "^1.4.3",
  "cors": "^2.8.4",
  "csurf": "^1.9.0",
  "express": "^4.16.4",
  "serverless-http": "^1.8.0",
}

// package.json dev dependencies
module.exports.devDependencies = {
  "@stellar-apps/babel-preset-react-app": "^1.0.4",
  "@stellar-apps/serverless-certificate-manager": "^1.0.5",
  "@stellar-apps/serverless-dotenv": "^1.0.2",
  "@stellar-apps/scripts": "^1.0.18",
  "@stellar-apps/webpack": "^1.0.9",
  "@stellar-apps/webpack-rimraf-plugin": "^1.0.3",
  "babel-loader": "^8.0.5",
  "file-loader": "^3.0.1",
  "serverless": "^1.37.0",
  "serverless-apigw-binary": "^0.4.4",
  "serverless-domain-manager": "^2.6.13",
  "serverless-offline": "^4.2.2",
  "serverless-plugin-lambda-warmup": "^1.0.1",
  "serverless-plugin-scripts": "^1.0.2",
  "serverless-webpack": "^5.2.0",
  "terser-webpack-plugin": "^1.2.2",
  "webpack": "^4.29.0",
  "webpack-cli": "^3.2.1",
  "webpack-node-externals": "^1.7.2",
}

// package.json peer dependencies
module.exports.peerDependencies = {
}

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
  packageJson.stellar = {
    type: 'serverless-api'
  }
  packageJson.scripts = {
    start: 'stellar-scripts start',
    deploy: 'stellar-scripts deploy',
    bundle: 'serverless webpack',
    teardown: 'stellar-scripts teardown',
    sls: 'serverless',
    postinstall: 'rimraf .cache-loader'
  }
  // this function must return a valid package.json object
  return packageJson
}