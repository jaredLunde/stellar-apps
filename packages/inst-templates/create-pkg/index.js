// const {flag, required, trim, getPkgJson} = require('@inst-pkg/template-utils')
// const os = require('os')
// const path = require('path')


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

// package.json dependencies
module.exports.dependencies = {
}

// package.json dev dependencies
module.exports.devDependencies = {
  "@babel/preset-typescript": "^7.3.3",
  "@stellar-apps/babel-preset-es": "^1.0.4",
  "ava": "^2.2.0",
  "babel-eslint": "^10.0.2",
  "cross-env": "^5.2.0",
  "eslint": "^6.1.0",
  "husky": "^3.0.2",
  "lint-staged": "^9.2.1",
  "prettier": "^1.18.2",
  "pretty-quick": "^1.11.1",
  "rimraf": "^2.6.3",
  "typescript": "^3.5.3"
}

// package.json peer dependencies
module.exports.peerDependencies = {}

module.exports.rename = (filename) => {
  if (filename.endsWith('gitignore') && !filename.endsWith('.gitignore')) {
    return filename.replace('gitignore', '.gitignore')
  }
  else if (filename.endsWith('npmignore') && !filename.endsWith('.npmignore')){
    return filename.replace('npmignore', '.npmignore')
  }

  return filename
}

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = function editPackageJson (
  packageJson, 
  variables /*from prompts() above*/
) {
  delete packageJson.main
  packageJson.main = 'dist/cjs/index.js'
  packageJson.module = 'dist/es/index.js'
  packageJson.types = 'dist/types/index.d.ts'
  packageJson.scripts = {
    "build": "yarn build:types && yarn build:es && yarn build:cjs",
    "build:es": "rimraf dist/es && cross-env NODE_ENV=production BABEL_ENV=es babel src --extensions .ts,.tsx,.js  --ignore \"**/*.test.js\",\"**/test.js\" --out-dir dist/es",
    "build:cjs": "rimraf dist/cjs && cross-env NODE_ENV=production BABEL_ENV=cjs babel src --extensions .ts,.tsx,.js --out-dir dist/cjs",
    "build:types": "rimraf dist/types && tsc -p tsconfig.json -d --outDir dist/types  && rimraf dist/types/**/*.js",
    "check-types": "tsc --noEmit --isolatedModules -p tsconfig.json",
    "format": "yarn format:src && yarn format:cjs && yarn format:es",
    "format:src": "prettier --write \"src/**/*.js\" \"src/**/*.ts\"",
    "format:es": "prettier --write \"dist/es/**/*.js\"",
    "format:cjs": "prettier --write \"dist/es/**/*.js\"",
    "lint": "eslint src --ext .jsx,.js,.ts,.tsx",
    "prepublishOnly": "yarn lint && yarn build && yarn format",
    "test": "yarn build:cjs && ava -v",
    "validate": "yarn check-types && yarn lint && yarn test && yarn format:src"
  }
  packageJson.ava = {
    "babel": false,
      "compileEnhancements": false,
      "files": [
        "dist/cjs/**/*.test.js",
        "dist/cjs/**/test.js"
      ]
  }
  packageJson.husky = {
    "hooks": {
      "pre-commit": "lint-staged && yarn check-types"
    }
  }
  packageJson["lint-staged"] = {
    "*.{js,jsx,ts,tsx}": [
      "eslint",
      "pretty-quick --staged"
    ]
  }
  // this function must return a valid package.json object
  return packageJson
}