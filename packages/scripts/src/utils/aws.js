import aws from 'aws-sdk'


export function getCredentials (env) {
  if (env.accessKeyId) {
    return new aws.Credentials(env.accessKeyId, env.secretAccessKey, env.sessionToken || null)
  }

  return new aws.SharedIniFileCredentials({
    profile: env.AWS_PROFILE,
    region: env.AWS_REGION || 'us-east-1'
  })
}