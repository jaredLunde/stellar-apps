import aws from 'aws-sdk'
import chalk from 'chalk'
import ora from 'ora'
import {flag, log, error, success} from '@inst-pkg/template-utils'


function assertHasDomains (domains) {
  if (!domains || domains.length === 0) {
    error(
      `No domains were configured for serverless-certificate-manager in: `
      + flag(`custom.certificateManager.domains`)
    )
    process.exit(1)
  }
}

async function wait (timeInSeconds) {
  await new Promise(resolve => setTimeout(resolve, timeInSeconds * 1000))
}

function getCredentials ({credentials: cfg}) {
  if (cfg.accessKeyId) {
    return new aws.Credentials(cfg.accessKeyId, cfg.secretAccessKey, cfg.sessionToken || null)
  }

  return new aws.SharedIniFileCredentials(cfg)
}

async function waitUntil (env, arn, status = 'PENDING_VALIDATION') {
  const spinner = ora({spinner: 'star2'})

  while (true) {
    // waits 5 seconds before checking status again
    spinner.start(`Waiting for certificate to be ${status}...`)
    await wait(8)
    spinner.stop()
    const cert = await getCert(env, arn)

    if (cert.Status === status) {
      break
    }
  }
}

// const FOUND = {}

async function getCert (env, arn) {
  // let spinner = FOUND[arn] ? null : ora({spinner: 'star2'}).start(`Finding certificate: ${flag(arn)}`)
  const acm = new aws.ACM({credentials: getCredentials(env), region: env.region || 'us-east-1'})

  try {
    const response = await acm.describeCertificate({CertificateArn: arn}).promise()

    // be sure to only display success message one
    // if (spinner) {
    //   FOUND[arn] = true
    //   spinner.succeed(`Found certificate: ${flag(arn)}`)
    // }

    return response.Certificate
  }
  catch (err) {
    // spinner.fail(`Could not find certificate: ${flag(arn)}`)
    console.log(err.message ? chalk.bold(err.message) : err)
    process.exit(1)
  }
}

async function getHostedZone (env, domain) {
  const spinner = ora({spinner: 'star2'}).start(`Finding hosted zone for: ${flag(domain)}`)

  const route53 = new aws.Route53({
    credentials: getCredentials(env),
    region: env.region || 'us-east-1'
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

async function updateDNSValidationRecord (action, env, arn) {
  const cert = await getCert(env, arn)
  const domain = cert.DomainName
  const hostedZone = await getHostedZone(env, domain)
  const validationOptions = cert.DomainValidationOptions
  const spinner = ora({spinner: 'star2'}).start(`Updating DNS validation records`)
  const route53 = new aws.Route53({
    credentials: getCredentials(env),
    region: env.region || 'us-east-1'
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
              Action: action,
              ResourceRecordSet: {Name, Type, ResourceRecords: [{Value}], TTL: 300}
            }
          }
        ).filter(Boolean),
        Comment: 'Record created by stellar-scripts',
      },
      HostedZoneId: hostedZone.Id,
    }

    const response = await route53.changeResourceRecordSets(params).promise()
    spinner.succeed(`Updated DNS validation records`)
    return response
  }
  catch (err) {
    spinner.fail(`Could not update validation records for: ${flag(domain)}`)
    console.log(err.message ? chalk.bold(err.message) : err)
    // process.exit(1)
  }
}

const createDNSValidationRecord = (env, arn) => updateDNSValidationRecord('CREATE', env, arn)
const removeDNSValidationRecord = (env, arn) => updateDNSValidationRecord('DELETE', env, arn)


function doesDomainMatch (domain, certDomain) {
  if (domain === certDomain) {
    return true
  }
  else if (domain.endsWith(certDomain.replace('*.'))) {
    const certDepth = certDomain.split('.')
    const domainDepth = domain.split('.')
    // wildcard domains should only match on depth
    if (certDomain.startsWith('*') && domainDepth === certDepth) {
      return true
    }
  }

  return false
}

async function findCerts ({domains, ...env}) {
  const acm = new aws.ACM({credentials: getCredentials(env), region: env.region || 'us-east-1'})
  const spinner = ora({spinner: 'star2'}).start(
    `Searching for certificates with domains: ${domains.join(', ')}`
  )
  try {
    const hasCerts = domains.map(() => false)
    const hasPotential = new Set()

    while (true) {
      const certs = (
        await acm.listCertificates({
          CertificateStatuses: ['PENDING_VALIDATION', 'ISSUED', 'INACTIVE']
        }).promise()
      ).CertificateSummaryList

      for (let cert of certs) {
        domains.forEach((domain, i) => {
          if (hasCerts[i] === false) {
            if (doesDomainMatch(domain, cert.DomainName)) {
              hasCerts[i] = cert.CertificateArn
            }
            else if (domain.endsWith(cert.DomainName.split('.').slice(-2).join('.'))) {
              hasPotential.add(cert.CertificateArn)
            }
          }
        })
      }

      for (let certArn of hasPotential) {
        spinner.stop()
        const cert = await getCert(env, certArn)
        for (let certDomainName of cert.SubjectAlternativeNames) {
          domains.forEach((domain, i) => {
            if (hasCerts[i] === false) {
              if (doesDomainMatch(domain, certDomainName)) {
                hasCerts[i] = cert.CertificateArn
              }
            }
          })
        }
        spinner.start()
      }

      // if all the certs are verified matches we're done here
      if (hasCerts.every(Boolean) || !certs.NextToken) {
        spinner.stop()
        return hasCerts
      }
    }
  }
  catch (err) {
    spinner.fail(`Could not search for certificates`)
    console.log(err.message ? chalk.bold(err.message) : err)
    process.exit(1)
  }
}

async function hasValidCerts ({domains, ...env}) {
  const acm = new aws.ACM({credentials: getCredentials(env), region: env.region || 'us-east-1'})
  const certs = await findCerts({domains, ...env})
  // if all the certs are verified matches we're done here
  if (certs.every(Boolean)) {
    success(`All domains have valid certificates\n  ${flag(domains.join('\n  '))}`)
    return certs
  }

  const numInvalid = certs.reduce((v, n) => n === false ? v + 1 : v, 0)
  log(
    `${numInvalid} ${numInvalid === 1 ? 'domain does' : 'domains do'} not have `
    + (numInvalid === 1 ? 'a valid certificate' : 'valid certificates')
  )
  console.log(' ', certs.map((v, i) => v ? !v : flag(domains[i])).filter(Boolean).join('\n  '))
  return certs
}

async function createCert ({domains, ...env}) {
  // determines the proper domain names to attach to the certificate
  // by default, a wildcard is added to any env domain
  const spinner = ora({spinner: 'star2'}).start(
    `Creating certificate for: ${flag(domains.join(', '))}`
  )
  // creates the certificate
  const acm = new aws.ACM({credentials: getCredentials(env), region: env.region || 'us-east-1'})
  const [DomainName, ...SubjectAlternativeNames] = domains
  const params = {
    DomainName,
    SubjectAlternativeNames: SubjectAlternativeNames.length ? SubjectAlternativeNames : null,
    ValidationMethod: 'DNS'
  }
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
    await waitUntil(env, response.CertificateArn)
    // creates the validation records for this certificate in Route 53
    await createDNSValidationRecord(env, response.CertificateArn)
    return response.CertificateArn
  }
  else {
    spinner.fail(`Could not create a certificate for: ${flag(domains.join(', '))}`)
    console.log(response.message ? chalk.bold(response.message) : response)
  }
}

async function removeCert (env) {
  if (env.retain === true) {
    return
  }

  const certs = (await findCerts(env)).filter(Boolean).filter(
    // makes sure ARNs are unique
    (value, index, self) => self.indexOf(value) === index
  )

  if (certs.length) {
    const spinner = ora({spinner: 'star2'})
    // removes the certificates
    const acm = new aws.ACM({credentials: getCredentials(env), region: env.region || 'us-east-1'})
    const responses = await Promise.all(certs.map(
      async (CertificateArn) => {
        await removeDNSValidationRecord(env, CertificateArn)
        await acm.deleteCertificate({CertificateArn}).promise()
        process.env.SERVERLESS__CERTIFICATE_ARN = CertificateArn
      }
    ))
    spinner.succeed(`Removed certificates: ${flag(certs.join(', '))}`)
    return responses
  }
}

async function isCertValid (env, arn) {
  if (!arn) {
    error('You must include a certificate ARN (--arn) as an option')
    process.exit(1)
  }
  const spinner = ora({spinner: 'star2'}).start(`Checking if certificate is valid: ${arn}`)

  try {
    FOUND[arn] = true
    const cert = await getCert(env, arn)
    spinner.stop()
    // cert was valid
    if (cert.Status === 'ISSUED') {
      success(cert.DomainName, flag(cert.Status))
      console.log(cert.CertificateArn)
      return true
    }
    // cert was not valid
    error(cert.DomainName, flag(cert.Status))

    if (cert.FailureReason) {
      console.log(FailureReason)
    }

    return false
  }
  catch (err) {
    // likely network or permissions error
    spinner.fail(`Could not confirm whether certificate is valid`)
    console.log(err.message ? chalk.bold(err.message) : err)
  }
}

async function waitUntilCertIsValid (env, arn) {
  if (!arn) {
    error('You must include a certificate ARN (--arn) as an option')
    process.exit(1)
  }

  const acm = new aws.ACM({credentials: getCredentials(env), region: env.region || 'us-east-1'})
  const spinner = ora({spinner: 'star2'}).start(`Waiting for certificate to be validated`)

  try {
    await acm.waitFor('certificateValidated', {CertificateArn: arn}).promise()
    spinner.stop()
    const cert = await getCert(env, arn)
    success(cert.DomainName, flag(cert.Status))
    console.log(arn)
    return true
  }
  catch (err) {
    spinner.fail(`Could not confirm certificate validation`)
    console.log(err.message ? chalk.bold(err.message) : err)
    return false
  }
}

function setIn (obj, path, value) {
  const keys =  path.split('.')

  keys.forEach(
    (key, i) => {
      if (i === keys.length - 1) {
        obj[key] = value
      }
      else if (obj[key] === void 0) {
        obj[key] = {}
      }

      obj = obj[key]
    }
  )
}

function getConfig (serverless) {
  // loads the custom config which declares domains
  let config =
    serverless.service.custom && serverless.service.custom.certificateManager
      ? serverless.service.custom.certificateManager
      : [{}]

  // sets defaults for each search definition
  return config.map(
    cfg => {
      // sets the AWS region for the certificates
      const region = cfg?.region || serverless.service.provider?.region || process.env.AWS_REGION
      // grabs the credentials
      const credentials = {
        profile: cfg?.credentials?.profile
          || serverless.service.provider?.profile
          || process.env.AWS_PROFILE,
        ...cfg.credentials
      }
      return {...cfg, credentials, region}
    }
  )
}

module.exports = class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless
    this.commands = {
      'has-valid-certs': {
        usage: 'Builds the client-side code for your web application',
        lifecycleEvents: [
          'hasValidCerts'
        ]
      },
      'wait-for-certs': {
        usage: 'Builds and deploys your client-side code to S3',
        lifecycleEvents: [
          'waitForCert',
        ]
      },
      'get-certs': {
        usage: 'Uploads your client-side code to S3 without building it',
        lifecycleEvents: [
          'getCert'
        ]
      },
      'create-certs': {
        usage: 'Uploads your client-side code to S3 without building it',
        lifecycleEvents: [
          'createCert'
        ]
      },
      'remove-certs': {
        usage: 'Uploads your client-side code to S3 without building it',
        lifecycleEvents: [
          'removeCert'
        ]
      },
    }

    const createCertsIfNecessary = () => {
      const configs = getConfig(this.serverless)

      return Promise.all(
        configs.map(
          async config => {
            const isValid = await hasValidCerts(config)

            if (isValid.every(Boolean) === false) {
              const needsCert = config.domains.filter((domain, i) => isValid[i] === false)
              const arn = await createCert({...config, domains: needsCert})
              await waitUntilCertIsValid(config, arn)

              if (Array.isArray(config.refFor)) {
                config.refFor.forEach(refFor => setIn(this.serverless.service, refFor, arn))
              }
            }
            else {
              if (Array.isArray(config.refFor)) {
                config.refFor.forEach(refFor => setIn(this.serverless.service, refFor, isValid[0]))
              }
            }
          }
        )
      )
    }

    this.hooks = {
      // runs right away on 'deploy'
      'after:package:initialize': createCertsIfNecessary,
      'has-valid-certs:hasValidCerts': () => Promise.all(
        getConfig(this.serverless).map(hasValidCerts)
      ),
      'wait-for-certs:waitForCert': async () => {
        for (let config of getConfig(this.serverless)) {
          const certs = (await findCerts(config)).filter(Boolean).filter(
            // makes sure ARNs are unique
            (value, index, self) => self.indexOf(value) === index
          )

          await Promise.all(certs.map(arn => waitUntilCertIsValid(config, arn)))
        }
      },
      'get-certs:getCert': async () => {
        for (let config of getConfig(this.serverless)) {
          const certs = (await findCerts(config)).filter(Boolean).filter(
            // makes sure ARNs are unique
            (value, index, self) => self.indexOf(value) === index
          )

          for (let cert of certs) {
            console.log('\n-------------------------------------------------------------------\n')
            console.log(flag(cert))
            console.log('\n-------------------------------------------------------------------')
            console.log(JSON.stringify(await getCert(config, cert), null, 2))
          }
        }
      },
      'create-certs:createCert': createCertsIfNecessary,
      // runs after `sls remove`
      'after:remove:remove': () => Promise.all(getConfig(this.serverless).map(removeCert)),
      'remove-certs:removeCert': () => Promise.all(getConfig(this.serverless).map(removeCert))
    }
  }
}