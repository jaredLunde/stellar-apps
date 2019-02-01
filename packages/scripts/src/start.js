import path from 'path'
import startRenderer from '@stellar-apps/ssr/startRenderer'
import {cmd, pwd, getPkgJson} from '@inst-pkg/template-utils'
import {findBin} from './utils'


export default async function start (
  {
    env,
    stage = 'development',
    host = '::',
    port = 3000,
    assets,
    clientConfig,
    serverConfig
  }
) {
  const pkgJson = getPkgJson(pwd())
  process.env.NODE_ENV = env || process.env.NODE_ENV
  process.env.BABEL_ENV = process.env.BABEL_ENV || process.env.NODE_ENV
  process.env.STAGE = process.env.STAGE || stage
  clientConfig = clientConfig || path.join(path.dirname(pkgJson.__path), 'webpack/client.config.js')
  serverConfig = serverConfig || path.join(path.dirname(pkgJson.__path), 'webpack/server.config.js')

  switch (pkgJson.stellar.type) {
    case 'static-app':
    case 'serverless-app':
      startRenderer({
        // dev webpack client config
        clientConfig: require(clientConfig),
        // dev webpack server config
        serverConfig: require(serverConfig),
        // path to local public assets
        publicAssets: assets,
        // micro-dev options
        silent: false,
        host,
        port
      })
      break;
    case 'api':
      const crossEnvBin = findBin('cross-env')
      const serverlessBin = findBin('serverless')

      await cmd.get(`
        ${crossEnvBin} \
          NODE_ENV=${process.env.NODE_ENV} \
          BABEL_ENV=${process.env.BABEL_ENV} \
          STAGE=${process.env.STAGE} \
        ${serverlessBin} offline start \
          --aws-s3-accelerate \
          --watch \
          --color
      `)
      break;
  }
}