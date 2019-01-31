import {cmd} from '@inst-pkg/template-utils'


export default async function deploy ({stage = 'staging'}) {
  const data = await cmd.get(`
    cross-env \
      NODE_ENV=production \
      BABEL_ENV=production \
      STAGE=${stage} \
    serverless deploy \
      ${init ? '' : '-f main'} \
      --stack ${stage} \
      --aws-s3-accelerate \
      --color
  `)

  console.log(data)
}