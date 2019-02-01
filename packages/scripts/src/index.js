#!/usr/bin/env node
import chalk from 'chalk'
import yargs from 'yargs'
import {log, flag} from './utils'
import start from './start'
import deploy from './deploy'


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
  'Deploys the nearest app or API with Serverless',
  yargs => {
    yargs.positional(
      'env', {
        describe: (
          `The stage to deploy in Serverless. If not provided this will default to  `
          + `process.env.STAGE || "staging".`
        )
      }
    )

    yargs.option(
      'init', {
        type: 'boolean',
        alias: 'i',
        describe: `Initializes a complete deploy, not just the main function`
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
    break;
  case 'deploy':
    deploy(args).then(logDone)
    break;
  default:
    log(
      flag('Error', 'red'),
      cmd ? 'command not found:' : 'No command was provided.',
      cmd ? `"${cmd}".` : '',
      'See --help for a list of commands.'
    )
}