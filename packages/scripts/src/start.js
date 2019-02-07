import path from 'path'
import startRenderer from '@stellar-apps/ssr/startRenderer'
import {cmd, pwd, getPkgJson} from '@inst-pkg/template-utils'
import childProc from 'child_process'
import {findBin} from './utils'


export default async function start (
  {
    env,
    stage = 'development',
    host = '::',
    port,
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
    case 'serverless-static-app':
      return startRenderer({
        // dev webpack client config
        clientConfig: require(clientConfig),
        // dev webpack server config
        serverConfig: require(serverConfig),
        // path to local public assets
        publicAssets: assets,
        // micro-dev options
        silent: false,
        host,
        port: port || 3000
      })
    case 'serverless-api':
      const crossEnvBin = findBin('cross-env')
      const serverlessBin = findBin('serverless')
      const proc = childProc.spawn(
        `
          ${crossEnvBin} \
            NODE_ENV=${process.env.NODE_ENV} \
            BABEL_ENV=${process.env.BABEL_ENV} \
            STAGE=development \
          ${serverlessBin} \
            offline \
            start \
            --host ${host} \
            --port ${port || 4000} \
            --stage development \
            --aws-s3-accelerate \
            --watch \
            --color
        `,
        [],
        {stdio: 'inherit', shell: true}
      )

      return new Promise(resolve => proc.on('close', resolve))
  }
}