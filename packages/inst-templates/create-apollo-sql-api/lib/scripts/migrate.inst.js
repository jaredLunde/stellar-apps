const
  path = require('path'),
  dotenv = require('dotenv'),
  {createBin} = require('@lunde-cloud/create-migration'),
  NODE_ENV = process.env.NODE_ENV || 'development'

// loads local environment variables
dotenv.config({path: path.join(__dirname, `../.env.${NODE_ENV}`)})
// creates the argument parser
createBin({
  functionName: 'lunde-cloud-migrations-production-main',
  bucket: 'lunde-migrations',
  migrations: {
    directory: path.join(__dirname, `../sql/migrations/${NODE_ENV}`),
    tableName: 'migrations',
    schemaName: '<:PKG_NAME:>_knex'
  },
  ssm: {
    paths: process.env.SSM_CONFIG_PATH && JSON.parse(process.env.SSM_CONFIG_PATH),
    options: {
      relativeTo: process.env.SSM_CONFIG_RELATIVE_TO
    }
  },
  profile: process.env.AWS_PROFILE,
  region: process.env.AWS_REGION,
  stage: process.env.STAGE
})