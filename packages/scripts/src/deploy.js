import childProc from 'child_process'
import {findBin} from './utils'
import {getPkgJson, pwd} from '@inst-pkg/template-utils'


export default async function deploy ({stage = 'staging', stack = false}) {
  const pkgJson = getPkgJson(pwd())
  const crossEnvBin = findBin('cross-env')
  stage = process.env.STAGE || stage
  const envDefs = `
    NODE_ENV=production \
    BABEL_ENV=${process.env.BABEL_ENV || 'production'} \
    STAGE=${stage} \
  `

  if (pkgJson.stellar.type.includes('serverless')) {
    const serverlessBin = findBin('serverless')
    let cmd

    if (stack || pkgJson.stellar.type !== 'serverless-static-app') {
      cmd = `
        ${crossEnvBin} \
        ${envDefs} \
        ${serverlessBin} \
          deploy \
          ${stack ? '' : '-f main'} \
          --stage ${stage} \
          --aws-s3-accelerate \
          --color
      `
    }
    else if (pkgJson.stellar.type === 'serverless-static-app') {
      // sls sync-bundle --stage=production
      cmd = `
        ${crossEnvBin} \
        ${envDefs} \
        ${serverlessBin} \
          sync-bundle \
          --stage ${stage} \
          --color
      `
    }

    const proc = childProc.spawn(cmd, [], {stdio: 'inherit', shell: true})
    return new Promise(resolve => proc.on('close', resolve))
  }
}