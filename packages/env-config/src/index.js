import camelCase from 'camel-case'


const configRe = /^CONFIG__/

function mergeEnvParam (config, key, val) {
  const keys = key.split('__')

  for (let i = 0; i < keys.length; i++) {
    let k = camelCase(keys[i])

    if (config.hasOwnProperty(k) === false) {
      config[k] = {}
    }

    if (keys.length - 1 === i) {
      config[k] = val
    }
    else {
      config = config[k]
    }
  }
}

function getEnvConfig (config, regex = configRe) {
  config = Object.assign({}, config)

  for (let key in process.env) {
    const cfgKey = key.replace(regex, '')

    if (cfgKey !== key) {
      mergeEnvParam(config, cfgKey, process.env[key])
    }
  }

  return config
}

export default getEnvConfig