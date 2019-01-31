import chalk from 'chalk'
import yargs from 'yargs'
import {log, flag} from './utils'


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
        )
      }
    )
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
    break;
  case 'deploy':
    break;
  default:
    log(
      flag('Error', 'red'),
      cmd ? 'command not found:' : 'No command was provided.',
      cmd ? `"${cmd}".` : '',
      'See --help for a list of commands.'
    )
}