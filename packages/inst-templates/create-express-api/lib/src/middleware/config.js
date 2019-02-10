import aws from 'aws-sdk'
import {camelCase} from 'change-case'


// loads .env environment variables
const configRe = /^CONFIG__/

export function mergeEnvParam (config, key, val) {
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

export function mergeEnvConfig (config) {
  config = Object.assign({}, config)

  for (let key in process.env) {
    const cfgKey = key.replace(configRe, '')

    if (cfgKey !== key) {
      let baseConfig = config
      mergeEnvParam(baseConfig, cfgKey, process.env[key])
    }
  }

  return config
}

export let config = mergeEnvConfig({})
let SSM_CREDENTIALS

if (__DEV__) {
  SSM_CREDENTIALS = new aws.SharedIniFileCredentials({profile: 'stellar-dev'})
}

export function loadConfig (ssmTtl, WithDecryption = true) {
  return function loadSSMParams (req, res, next) {
    req.config = config
    const ssmConfig = process.env.SSM_CONFIG && JSON.parse(process.env.SSM_CONFIG)

    if (ssmConfig) {
      maybeInvalidateCache(ssmTtl)

      let Names = ssmConfig.filter(
        name => cache.items.has(name) === false
      )

      if (Names.length > 0) {
        let promises = []
        const params =
          __DEV__
            ? {credentials: SSM_CREDENTIALS, region: 'us-east-1'}
            : {region: 'us-east-1'}
        const ssm = new aws.SSM(params)
        const paths = Names.filter(name => name.startsWith('path:') === true)

        if (paths.length > 0) {
          promises = promises.concat(
            paths.map(
              Path => !!cache.items.add(Path) && new Promise(
                resolve => ssm.getParametersByPath(
                  {
                    Path: Path.replace('path:', ''),
                    Recursive: true,
                    WithDecryption
                  },
                  mergeSSMParam(resolve)
                )
              )
            )
          )
        }

        Names = Names.filter(name => name.startsWith('path:') === false)
        Names.length > 0 && promises.push(
          new Promise(
            resolve => ssm.getParameters(
              {Names, WithDecryption},
              mergeSSMParam(resolve)
            )
          )
        )

        return Promise.all(promises).then(() => next())
      }
    }

    next()
  }
}

function clearConfig () {
  for (let key in config) {
    delete config[key]
  }
}

const cache = {
  expires: null,
  items: new Set()
}

function mergeSSMParam (resolve) {
  return function (err, data) {
    if (err !== null) {
      res.status(400)
      res.send(JSON.stringify({error: err, status: 400}))
    }

    if (data !== null) {
      for (let param of data.Parameters) {
        cache.items.add(param.Name)

        if (param.Name.startsWith('/')) {
          param.Name = param.Name.replace('/', '')
        }

        mergeEnvParam(config, param.Name.replace(/\//g, '__'), param.Value)
      }
    }

    resolve()
  }
}

function maybeInvalidateCache (ssmTtl) {
  const now = Date.now()

  if (cache.expires === null) {
    cache.expires = now + ssmTtl
  }
  else if (now >= cache.expires) {
    clearConfig()
    Object.assign(config, mergeEnvConfig(stageConfig))
    cache.items.clear()
    cache.expires = now + ssmTtl
  }
}

export default loadConfig(86400 * 365) 
