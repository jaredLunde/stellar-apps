import * as aws from 'aws-sdk'
import deepMerge from '@essentials/deep-merge'
import envToObject from '@essentials/env-to-object'
import ssmToObject from 'parameter-store-to-object'


const
  relativeTo = /^CONFIG__/i,
  createEnvConfig = () => envToObject({
    relativeTo,
    filter: key => key.match(relativeTo) !== null
  })

export let
  config = createEnvConfig(),
  clear = () => { for (let key in config) delete config[key] },
  cache = {
    expires: null,
    items: new Set()
  }

const maybeInvalidateCache = ttl => {
  const now = Date.now()

  if (cache.expires === null)
    cache.expires = now + ttl
  else if (now >= cache.expires) {
    clear()
    Object.assign(config, createEnvConfig())
    cache.items.clear()
    cache.expires = now + ttl
  }
}

export const createConfig = async ({paths, relativeTo, profile, region = 'us-east-1'}) => {
  if (paths && paths.length > 0) {
    let params = {region}
    if (profile)
      params.credentials = new aws.SharedIniFileCredentials({profile})

    const ssmConfig = await ssmToObject(new aws.SSM(params), paths, {relativeTo})
    Object.assign(config, deepMerge(config, ssmConfig))
  }
}

export default ({paths, relativeTo, profile, region, ttl}) => (req, res, next) => {
  if (paths && paths.length > 0) {
    maybeInvalidateCache(ttl)
    paths = paths.filter(name => {
      const cached = cache.items.has(name) === false
      cache.items.add(name)
      return cached
    })

    try {
      createConfig({paths, relativeTo, profile, region}).then(() => {
        req.config = config
        next()
      })
    }
    catch (error) {
      res.status(400)
      res.send(JSON.stringify({error, status: 400}))
    }
  }
  else {
    req.config = config
    next()
  }
}