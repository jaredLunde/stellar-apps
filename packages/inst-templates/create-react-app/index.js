const {flag, required, trim, getPkgJson, autocompleteIni} = require('@inst-pkg/template-utils')
const os = require('os')
const path = require('path')
const fuzzy = require('fuzzy')

module.exports = {}
const CREDENTIALS_FILE = path.join(os.homedir(), '.aws/credentials')

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, /*default template variables*/
  packageJson,                               /*contents of the package.json file as a plain object*/
  args,
  inquirer
) => {
  const prompts = [
    // See https://github.com/SBoudrias/Inquirer.js#objects
    // for valid prompts
    {
      name: 'DOMAIN_STAGING',
      message: `Domain name     ${flag('staging', 'white')}:`,
      filter: trim,
      validate: required
    },

    {
      name: 'DOMAIN_PRODUCTION',
      message: `Domain name  ${flag('production', 'green')}:`,
      default: a => a.DOMAIN_STAGING.replace(/^staging[-.]?/, '').replace(/-staging/, ''),
      filter: trim,
      validate: required
    },

    autocompleteIni(inquirer, CREDENTIALS_FILE, {
      name: 'AWS_PROFILE_STAGING',
      message: `AWS Profile     ${flag('staging', 'white')}:`,
      default: `${PKG_NAME}-dev`,
      filter: trim,
      validate: required,
    }),

    autocompleteIni(inquirer, CREDENTIALS_FILE, {
      name: 'AWS_PROFILE_PRODUCTION',
      message: `AWS Profile  ${flag('production', 'green')}:`,
      filter: trim,
      validate: required,
      source: (file, answers, input) => {
        input = input || ''
        const guesses = Object.keys(file)
        const guess = answers.AWS_PROFILE_STAGING.replace(/-dev$/, '-prod')
        guesses.splice(prompts.indexOf(guess), 1)
        guesses.unshift(guess)
        const fuzzyResult = fuzzy.filter(input, guesses)
        return new Promise(resolve => resolve(fuzzyResult.map(el => el.original)))
      }
    }),

    {
      name: 'S3_BUCKET_STAGING',
      message: `S3 bucket       ${flag('staging', 'white')}:`,
      default: a => `${PKG_NAME}-staging-public`,
      filter: trim,
      validate: required
    },

    {
      name: 'S3_BUCKET_PRODUCTION',
      message: `S3 bucket    ${flag('production', 'green')}:`,
      default: a => `${a.S3_BUCKET_STAGING.replace('staging-', '')}`,
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
  "curls": "^2.0.3",
  "invariant": "2.2.4",
  "polished": "^2.3.1",
  "prop-types": "^15.6.2",
  "react": "^16.7.0",
  "react-dom": "^16.7.0",
  "react-broker": "^1.0.15",
  "react-helmet-async": "^0.2.0",
  "serverless-http": "^1.9.0",
}

// package.json dev dependencies
module.exports.devDependencies = {
  "@stellar-apps/babel-preset-react-app": "^1.0.4",
  "@stellar-apps/scripts": "^1.0.0",
  "@stellar-apps/serverless-deploy-client-bundle": "^1.0.1",
  "@stellar-apps/serverless-dotenv": "^1.0.2",
  "@stellar-apps/webpack": "^1.0.9",
  "babel-loader": "^8.0.5",
  "compression-webpack-plugin": "^2.0.0",
  "json-loader": "^0.5.7",
  "file-loader": "^3.0.1",
  "ignore-emit-webpack-plugin": "^1.0.2",
  "imagemin-jpegtran": "^6.0.0",
  "imagemin-mozjpeg": "^8.0.0",
  "imagemin-optipng": "^6.0.0",
  "imagemin-webpack": "^4.1.0",
  "raw-loader": "^1.0.0",
  "serverless": "^1.36.3",
  "serverless-apigw-binary": "^0.4.4",
  "serverless-domain-manager": "^2.6.13",
  "serverless-content-encoding": "^1.1.0",
  "serverless-plugin-lambda-warmup": "^1.0.1",
  "serverless-webpack": "^5.2.0",
  "sharp": "^0.21.3",
  "terser-webpack-plugin": "^1.2.1",
  "webpack": "^4.29.0",
  "webpack-bundle-analyzer": "^3.0.3",
  "webpack-cli": "^3.2.1",
  "webpack-node-externals": "^1.7.2",
}

// package.json peer dependencies
module.exports.peerDependencies = {}

// filter for only including template files that return `true` here
// NOTE: this function is never called if `exclude` is defined
//module.exports.include = function include (filename, variables /*from prompts() above*/) {
//  return true
//}

// filter for excluding template files that return true here
// NOTE: this function takes precedence over include() above
// module.exports.exclude = function exclude (filename, variables /*from prompts() above*/) {
//   return false
// }

// filter for renaming files
//module.exports.rename = function rename (filename, variables /*from prompts() above*/) {
//  return filename
//}

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = function editPackageJson (
  packageJson, 
  variables /*from prompts() above*/
) {
  packageJson.scripts = {
    analyze: 'ANALYZE=true yarn start',
    cert: 'stellar-scripts cert',
    start: 'stellar-scripts start',
    deploy: 'stellar-scripts deploy'
  }
  
  // this function must return a valid package.json object
  return packageJson
}