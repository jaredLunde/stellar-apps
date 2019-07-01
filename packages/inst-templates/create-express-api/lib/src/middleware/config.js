import expressConfig from '@stellar-apps/express-config-middleware'


export {createConfig, config, clear} from '@stellar-apps/express-config-middleware'
export default expressConfig({
  ttl: process.env.SSM_CONFIG_TTL,
  paths: process.env.SSM_CONFIG_PATH && JSON.parse(process.env.SSM_CONFIG_PATH),
  relativeTo: process.env.SSM_CONFIG_RELATIVE_TO,
  profile: (process.env.STAGE || 'development') === 'development' ? process.env.AWS_PROFILE : void 0,
  region: process.env.AWS_REGION,
})