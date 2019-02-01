import childProc from 'child_process'
import {findBin} from './utils'
import {getPkgJson, pwd} from '@inst-pkg/template-utils'


export default async function deploy ({stage = 'staging', init = false}) {
  const pkgJson = getPkgJson(pwd())
  const crossEnvBin = findBin('cross-env')
  stage = process.env.STAGE || stage

  if (pkgJson.stellar.type.includes('serverless')) {
    const serverlessBin = findBin('serverless')
    const proc = childProc.spawn(
      `
        ${crossEnvBin} \
          NODE_ENV=production \
          BABEL_ENV=${process.env.BABEL_ENV || 'production'} \
          STAGE=${stage} \
        ${serverlessBin} deploy \
          ${init ? '' : '-f main'} \
          --stage ${stage} \
          --aws-s3-accelerate \
          --color
      `,
      [],
      {stdio: 'inherit', shell: true}
    )

    return new Promise(resolve => proc.on('close', resolve))
  }
}