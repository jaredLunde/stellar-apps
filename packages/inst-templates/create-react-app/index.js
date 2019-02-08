const {flag, required, trim, getPkgJson, autocompleteIni} = require('@inst-pkg/template-utils')
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
      name: 'S3_BUCKET_PRODUCTION',
      message: `S3 bucket    [${flag('production', 'green')}]:`,
      default: a => `${PKG_NAME}-public`,
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
    },

    {
      name: 'S3_BUCKET_STAGING',
      message: `S3 bucket       [${flag('staging', 'white')}]:`,
      default: a => `${a.S3_BUCKET_PRODUCTION.replace('-public', '-staging-public')}`,
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
  "@emotion/core": "^10.0.6",
  "@stellar-apps/ssr": "^2.0.0",
  "curls": "^2.0.3",
  "invariant": "2.2.4",
  "polished": "^2.3.1",
  "prop-types": "^15.6.2",
  "react": "^16.8.1",
  "react-dom": "^16.8.1",
  "react-broker": "^1.0.15",
  "react-helmet-async": "^0.2.0",
  "serverless-http": "^1.9.0",
}

// package.json dev dependencies
module.exports.devDependencies = {
  "@stellar-apps/babel-preset-react-app": "^1.0.4",
  "@stellar-apps/scripts": "^1.0.0",
  "@stellar-apps/serverless-certificate-manager": "^1.0.5",
  "@stellar-apps/serverless-sync-bundle": "^1.0.4",
  "@stellar-apps/serverless-dotenv": "^1.0.2",
  "@stellar-apps/webpack": "^1.0.9",
  "@stellar-apps/webpack-rimraf-plugin": "^1.0.3",
  "babel-loader": "^8.0.5",
  "compression-webpack-plugin": "^2.0.0",
  "dotenv-webpack": "^1.7.0",
  "json-loader": "^0.5.7",
  "file-loader": "^3.0.1",
  "ignore-emit-webpack-plugin": "^1.0.2",
  "imagemin-jpegtran": "^6.0.0",
  "imagemin-mozjpeg": "^8.0.0",
  "imagemin-optipng": "^6.0.0",
  "imagemin-webpack": "^4.1.0",
  "raw-loader": "^1.0.0",
  "responsive-loader": "^1.2.0",
  "serverless": "^1.37.0",
  "serverless-apigw-binary": "^0.4.4",
  "serverless-domain-manager": "^2.6.13",
  "serverless-plugin-lambda-warmup": "^1.0.1",
  "serverless-plugin-scripts": "^1.0.2",
  "serverless-webpack": "^5.2.0",
  "sharp": "^0.21.3",
  "terser-webpack-plugin": "^1.2.2",
  "webpack": "^4.29.0",
  "webpack-bundle-analyzer": "^3.0.3",
  "webpack-cli": "^3.2.1",
  "webpack-stats-plugin": "^0.2.1",
  "webpack-node-externals": "^1.7.2",
}

// package.json peer dependencies
module.exports.peerDependencies = {}

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
    type: 'serverless-app'
  }
  packageJson.scripts = {
    analyze: 'ANALYZE=true yarn start production',
    start: 'stellar-scripts start',
    deploy: 'stellar-scripts deploy',
    bundle: 'stellar-scripts bundle',
    teardown: 'stellar-scripts teardown',
    sls: 'serverless'
  }
  // this function must return a valid package.json object
  return packageJson
}