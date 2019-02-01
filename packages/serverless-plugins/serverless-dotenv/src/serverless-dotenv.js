// Major credit to: https://raw.githubusercontent.com/colynb/serverless-dotenv-plugin/master/index.js
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import minimatch from 'minimatch'


function exclude (exclusions) {
  return !exclusions || !exclusions.length ? () => true : function (name) {
    for (let glob of exclusions) {
      if (glob === '*' || minimatch(name, glob)) {
        return false
      }
    }

    return true
  }
}

function assignEnv (func, variables, stageVariables) {
  const stageEnvironment = {}
  stageVariables.forEach(variable => stageEnvironment[variable] = variables[variable])

  func.environment = {
    ...func.environment,
    ...stageEnvironment
  }

  return func.environment
}

module.exports = class ServerlessPlugin {
  constructor(serverless, options) {
    this.name = 'serverless-dotenv'
    this.serverless = serverless
    this.loadEnv(options)
  }

  get config () {
    return this.serverless.service.custom && this.serverless.service.custom.dotenv
  }

  log (msg) {
    this.serverless.cli.log(msg, this.name)
  }

  loadEnv({stage}) {
    stage = stage || this.serverless.service.provider.stage
    const path =
      this?.config?.path
        ? path.join(this.serverless.config.servicePath, this.config.path)
        : stage && fs.existsSync(`.env.${stage}`)
          ? '.env.' + stage
          : '.env'

    this.log(chalk.bold(path))
    let variables = dotenvExpand(dotenv.config({path})).parsed
    const {functions} = this.serverless.service

    if (variables) {
      if (this?.config?.exclude) {
        Object.keys(functions).forEach(fn => {
          assignEnv(
            functions[fn],
            variables,
            Object.keys(variables).filter(
              Array.isArray(this.config.exclude)
                ? exclude(this.config.exclude)
                : exclude(this.config.exclude[fn])
            )
          )
        })
        // glob === '*' || minimatch(filename, glob) === true
      }
      else if (this?.config?.include) {
        Object.keys(functions).forEach(fn => {
          assignEnv(
            functions[fn],
            variables,
            Object.keys(variables).filter(
              (...args) =>
                Array.isArray(this.config.include)
                  ? !exclude(this.config.include)(...args)
                  : !exclude(this.config.include[fn])(...args)
            )
          )
        })
      }
      else {
        Object.keys(functions).forEach(
          fn => assignEnv(functions[fn], variables, Object.keys(variables))
        )
      }
    } else {
      this.log('Could not find a .env file')
    }

    Object.keys(functions).forEach(fn => {
      this.log(`${chalk.bold(fn)} environment`)
      Object.keys(functions[fn].environment || {}).forEach(key => this.log('  ⇢ ' + key))
    })
  }
}