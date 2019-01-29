import fs from 'fs'
import aws from 'aws-sdk'
import chalk from 'chalk'
import path from 'path'
import ora from 'ora'
import dotenv from 'dotenv'
import {flag} from '@inst-pkg/template-utils'
import {success, wait, pwd, error, getCredentials, writeJson} from './utils'


function getProductionEnv (throws = true) {
  let envFile = path.join(pwd(), `.env.production`)
  envFile = fs.existsSync(envFile) ? envFile : path.join(pwd(), '.env')

  if (fs.existsSync(envFile)) {
    dotenv.config({path: envFile})
    return process.env
  }

  if (throws) {
    error('Could not find a valid .env.production or .env file')
    process.exit(1)
  }

  return process.env
}

async function waitUntil (arn, status = 'PENDING_VALIDATION') {
  const spinner = ora({spinner: 'star2'})

  while (true) {
    // waits 5 seconds before checking status again
    spinner.start(`Waiting for certificate to be ${status}...`)
    await wait(5)
    spinner.stop()
    const cert = await getCertificate(arn)

    if (cert.Status === status) {
      spinner.succeed(`${status}: ${flag(arn)}`)
      break
    }
  }
}

const FOUND = {}

export async function getCertificate (arn) {
  const env = getProductionEnv(false)
  const spinner = ora({spinner: 'star2'}).start(`Finding certificate: ${flag(arn)}`)
  const acm = new aws.ACM({
    credentials: getCredentials(env),
    region: env.AWS_REGION || 'us-east-1'
  })

  try {
    const response = await acm.describeCertificate({CertificateArn: arn}).promise()

    // be sure to only display success message one
    if (FOUND[arn]) {
      spinner.stop()
    }
    else {
      FOUND[arn] = true
      spinner.succeed(`Found certificate: ${flag(arn)}`)
    }

    return response.Certificate
  }
  catch (err) {
    spinner.fail(`Could not find certificate: ${flag(arn)}`)
    console.log(err.message ? chalk.bold(err.message) : err)
    process.exit(1)
  }
}

export async function getHostedZone (domain) {
  const env = getProductionEnv(false)
  const spinner = ora({spinner: 'star2'}).start(`Finding hosted zone for: ${flag(domain)}`)

  const route53 = new aws.Route53({
    credentials: getCredentials(env),
    region: env.AWS_REGION || 'us-east-1'
  })

  try {
    const response = await route53.listHostedZones({}).promise()
    domain = `${domain}.`

    for (let zone of response.HostedZones) {
      if (domain.endsWith(zone.Name)) {
        spinner.succeed(`Found hosted zone for: ${flag(zone.Name)} [${zone.Id}]`)
        return zone
      }
    }
  }
  catch (err) {
    spinner.fail(`Could find hosted zone for: ${flag(domain)}`)
    console.log(err.message ? chalk.bold(err.message) : err)
    process.exit(1)
  }

  spinner.fail(`Could find hosted zone for: ${flag(domain)}`)
  process.exit(1)
}

export async function createDNSValidationRecord (arn) {
  const env = getProductionEnv(false)
  const cert = await getCertificate(arn)
  const domain = cert.DomainName
  const hostedZone = await getHostedZone(domain)
  const validationOptions = cert.DomainValidationOptions
  const spinner = ora({spinner: 'star2'}).start(`Updating DNS with validation records`)
  const route53 = new aws.Route53({
    credentials: getCredentials(env),
    region: env.AWS_REGION || 'us-east-1'
  })

  try {
    const seen = []
    const params = {
      ChangeBatch: {
        // grabs the resource records from the certificate and properly formats
        // the changes to this DNS record set
        Changes: validationOptions.map(
          ({ResourceRecord: {Name, Value, Type}}) => {
            if (seen.includes(Name)) {
              return false
            }

            seen.push(Name)
            return {
              Action: 'CREATE',
              ResourceRecordSet: {Name, Type, ResourceRecords: [{Value}], TTL: 300}
            }
          }
        ).filter(Boolean),
        Comment: 'Record created by stellar-scripts',
      },
      HostedZoneId: hostedZone.Id,
    }

    const response = await route53.changeResourceRecordSets(params).promise()
    spinner.succeed(`Updated DNS with validation records`)
    return response
  }
  catch (err) {
    spinner.fail(`Could create validation records for: ${flag(domain)}`)
    console.log(err.message ? chalk.bold(err.message) : err)
    process.exit(1)
  }
}

export async function createCert ({domains}) {
  const env = getProductionEnv(false)
  // determines the proper domain names to attach to the certificate
  // by default, a wildcard is added to any env domain
  if (!domains || domains.length === 0) {
    domains = env.DOMAIN ? [env.DOMAIN, `*.${env.DOMAIN}`] : []
  }

  if (domains.length === 0) {
    error(
      'Could not find a DOMAIN environment variable and no domains were defined in arguments')
    process.exit(1)
  }

  const spinner = ora({spinner: 'star2'}).start(
    `Creating certificate for: ${flag(domains.join(', '))}`
  )
  // creates the certificate
  const acm = new aws.ACM({
    credentials: getCredentials(env),
    region: env.AWS_REGION || 'us-east-1'
  })
  const [DomainName, ...SubjectAlternativeNames] = domains
  const params = {DomainName, SubjectAlternativeNames, ValidationMethod: 'DNS'}
  let response

  try {
    response = await acm.requestCertificate(params).promise()
  }
  catch (err) {
    response = err
  }
  // this indicates a successful response, otherwise we can assume there was a failure
  if (response.CertificateArn) {
    spinner.succeed(`Created certificate for: ${flag(domains.join(', '))}`)
    // waits for the certificate to be issued before creating DNS records
    await waitUntil(response.CertificateArn, 'PENDING_VALIDATION')
    // creates the validation records for this certificate in Route 53
    await createDNSValidationRecord(response.CertificateArn)
    success(`Check the status of your certificate with:`)
    console.log(flag(`yarn check-cert ${response.CertificateArn}`))
  }
  else {
    spinner.fail(`Could not create a certificate for: ${flag(domains.join(', '))}`)
    console.log(response.message ? chalk.bold(response.message) : response)
  }
}

export async function checkCert ({arn}) {
  if (!arn) {
    error('You must include a certificate ARN as your first option')
    process.exit(1)
  }

  const cert = await getCertificate(arn)
  const env = getProductionEnv(false)
  const acm = new aws.ACM({
    credentials: getCredentials(env),
    region: env.AWS_REGION || 'us-east-1'
  })
  const spinner = ora({spinner: 'star2'}).start(`Waiting for certificate to be validated`)

  try {
    await acm.waitFor('certificateValidated', {CertificateArn: arn})
    spinner.stop()
    success(cert.DomainName, flag(cert.Type))
  }
  catch (err) {
    spinner.fail(`Could not confirm certificate validation`)
    console.log(err.message ? chalk.bold(err.message) : err)
  }
}