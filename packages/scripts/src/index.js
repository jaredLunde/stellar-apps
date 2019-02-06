#!/usr/bin/env node
import chalk from 'chalk'
import yargs from 'yargs'
import {log, flag} from './utils'
import start from './start'
import bundle from './bundle'
import deploy from './deploy'
import teardown from './teardown'


yargs.scriptName('stellar-scripts')

yargs.command(
  'start [env]',
  'Starts the nearest app or API in a development server',
  yargs => {
    yargs.positional(
      'env', {
        describe: (
          `The node environment to start the app in. If not provided, this will default to  `
          + `NODE_ENV || "development".`
        ),
        type: 'string'
      }
    )

    yargs.option('host', {
      alias: 'h',
      type: 'string'
    })

    yargs.option('port', {
      alias: 'p',
      type: 'number'
    })

    yargs.option('assets', {
      alias: 'a',
      type: 'string'
    })

    yargs.option('client-config', {
      alias: 'c',
      type: 'string'
    })

    yargs.option('server-config', {
      alias: 's',
      type: 'string'
    })
  }
)

yargs.command(
  'deploy [stage]',
  'Deploys the nearest app or API with Serverless/CloudFormation',
  yargs => {
    yargs.positional(
      'stage', {
        describe: (
          `The stage to deploy in Serverless. If not provided this will default to  `
          + `process.env.STAGE || "staging".`
        )
      }
    )

    yargs.option(
      'stack', {
        type: 'boolean',
        alias: 's',
        describe: `Initializes a complete stack deployment, not just the main function`
      }
    )
  }
)

yargs.command(
  'bundle [stage]',
  'Bundles the nearest app or API with `sls bundle`',
  yargs => {
    yargs.positional(
      'stage', {
        describe: (
          `The stage to deploy in Serverless. If not provided this will default to  `
          + `process.env.STAGE || "staging".`
        )
      }
    )
  }
)

yargs.command(
  'teardown [stage]',
  'Removes the nearest app or API with Serverless/CloudFormation',
  yargs => {
    yargs.positional(
      'stage', {
        describe: (
          `The stage to teardown in Serverless. If not provided this will default to  `
          + `process.env.STAGE || "staging".`
        )
      }
    )
  }
)

const args = yargs.argv

// the command is the first argument
const [cmd] = args._

function logDone () {
  log(chalk.grey('done'))
}

// routes the cmd
switch (cmd) {
  case 'start':
    start(args).then(logDone)
    break
  case 'deploy':
    deploy(args).then(logDone)
    break
  case 'bundle':
    bundle(args).then(logDone)
    break
  case 'teardown':
    teardown(args).then(logDone)
    break
  default:
    log(
      flag('Error', 'red'),
      cmd ? 'command not found:' : 'No command was provided.',
      cmd ? `"${cmd}".` : '',
      'See --help for a list of commands.'
    )
}