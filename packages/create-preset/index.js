const fs = require('fs')
const path = require('path')
const semver = require('semver')
const prettier = require('prettier')


function assign (defaultOpt, name) {
  return `Object.assign(${JSON.stringify(defaultOpt)}, opt.${name})`
}

function deepAssign (defaultOpt, name) {
  return `deepAssign(${JSON.stringify(defaultOpt)}, opt.${name})`
}


function extendProd (dependencies, opt) {
  dependencies.production = Object.assign({}, dependencies.development)
  for (let key in opt) {
    dependencies.production[key] = Object.assign(
      {},
      dependencies.development[key],
      opt[key]
    )
  }
}


const indexJS = `// v{{VERSION}} // ${(new Date()).toLocaleDateString('en-US')} //

function req (plugin) {
  var module = require(plugin)
  return module.default || module
}


function isPlainObject (o) {
  if (o !== null && typeof o === 'object') {
    var proto = Object.getPrototypeOf(o)
    return proto === Object.prototype || proto === null
  }

  return false
}


function deepAssign () {
  var head = arguments[0]
  var objects = Array.prototype.slice.call(arguments, 1)

  for (var i = 0; i < objects.length; i++) {
    var next = objects[i]

    for (var key in next) {
      var nextObj = next[key]

      if (isPlainObject(nextObj) && isPlainObject(head[key])) {
        head[key] = deepAssign(head[key], nextObj)
      }
      else {
        head[key] = nextObj
      }
    }
  }

  return head
}


module.exports = function (api, opt) {
  var env = process.env.NODE_ENV

  if (env === 'production') {
    return {
      presets: [{{PRESETS_PROD}}
      ],

      plugins: [{{PLUGINS_PROD}}
      ]
    }
  }
  else {
    return {
      presets: [{{PRESETS_DEV}}
      ],

      plugins: [{{PLUGINS_DEV}}
      ]
    }
  }
}
`

function r (plugin, options, isOptional) {
  const o = !isOptional ? '' : `opt.${isOptional} === false ? {} : `
  return `${o}[req('${plugin}'), ${options || "{}"}],`
}

function run (dependencies) {
  const [bump] = process.argv.slice(2)
  let pkgPath = path.join(process.cwd(), 'package.json')
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath).toString())

  if (bump) {
    if (bump !== 'dev') {
      pkgJson.version = semver.inc(pkgJson.version, bump)
      console.log('[Version] bump', pkgJson.version)
      console.log('-'.repeat(80))
    }
  }
  else {
    throw new Error('You must include a version as the first argument.')
  }

  // creates the package.json dependencies
  const pkgDependencies = {}
  let PLUGINS_DEV = ''
  let PLUGINS_PROD = ''
  let PRESETS_DEV = ''
  let PRESETS_PROD = ''

  function buildDep (key, dep, env) {
    const flagText = (
      dep.isBabelPreset
        ? 'Preset'
        : dep.isBabelPlugin
          ? 'Plugin'
          : 'Dependency'
    )

    console.log(
      `[${flagText}]${env ? ' ' + env + ':' : ''}`,
      key,
      '->',
      dep.version || dep
    )

    pkgDependencies[key] = dep.version|| dep
    const req = r(key, dep.options, dep.isOptional)

    if (dep.isBabelPlugin === true) {
      if (env === 'development') {
        PLUGINS_DEV += req
      }
      else {
        PLUGINS_PROD += req
      }
    }
    else if (dep.isBabelPreset === true) {
      if (env === 'development') {
        PRESETS_DEV += req
      }
      else {
        PRESETS_PROD += req
      }
    }
  }

  if (dependencies.development || dependencies.production) {
    for (let env of ['development', 'production']) {
      Object.keys(dependencies[env] || []).map(
        k => buildDep(k, dependencies[env][k], env)
      )
    }
  }
  else {
    Object.keys(dependencies).map(k => buildDep(k, dependencies[k]))
  }


  pkgJson.dependencies = pkgDependencies

  if (bump === 'dev') {
    pkgPath = path.join(process.cwd(), 'package.dev.json')
  }

  // saves package.json
  fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2))

  if (PRESETS_DEV || PRESETS_PROD || PLUGINS_DEV || PLUGINS_PROD) {
    // renders and saves index.js
    const index = indexJS.replace('{{VERSION}}', pkgJson.version)
                         .replace('{{PRESETS_DEV}}', PRESETS_DEV)
                         .replace('{{PRESETS_PROD}}', PRESETS_PROD)
                         .replace('{{PLUGINS_DEV}}', PLUGINS_DEV)
                         .replace('{{PLUGINS_PROD}}', PLUGINS_PROD)

    let indexPath = path.join(process.cwd(), 'index.js')

    if (bump === 'dev') {
      indexPath = path.join(process.cwd(), 'index.dev.js')
    }

    fs.writeFileSync(
      indexPath,
      prettier.format(index, {
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: false,
        parser: 'babel'
      })
    )
  }
}


module.exports = {
  assign,
  deepAssign,
  extendProd,
  run,
  default: run
}
