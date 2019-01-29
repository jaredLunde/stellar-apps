import chalk from 'chalk'
import yargs from 'yargs'
import {createCert, checkCert} from './cert'
import {log, flag} from './utils'


yargs.scriptName('stellar-scripts')

yargs.command(
  'create-cert [domains..]',
  'Requests a certificate with ACM for the current app',
  yargs => {
    yargs.positional(
      'domains', {
        describe: (
          `Domains to add to a new ACM certificate. `
          + `If empty, stellar-scripts will try to find a DOMAIN in your .env.production file.`
        )
      }
    )
  }
)

yargs.command(
  'check-cert [arn]',
  'Checks the status of an ACM certificate',
  yargs => {
    yargs.positional(
      'arn', {
        describe: (
          `The ARN of the certificate you'd like to check the status of. `
          + `If empty, stellar-scripts will try to find an ARN in your package.json`
        )
      }
    )
  }
)

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
  case 'create-cert':
    createCert(args).then(logDone)
    break;
  case 'check-cert':
    checkCert(args).then(logDone)
    break;
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