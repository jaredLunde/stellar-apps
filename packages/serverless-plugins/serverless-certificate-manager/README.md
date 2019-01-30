# @stellar-apps/serverless-certificate-manager
An ACM certificate manager for API Gateway Lambda functions with custom domain names. This
plugin will automatically create your ACM certificates before your first deployment and
wait for them to become valid before continuing your deployment. It will not run when
individual functions are deployed.

## Installation
`yarn add --dev @stellar-apps/serverless-certificate-manager`

## Usage
```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-certificate-manager
 
custom:
  certificateManager:
    domains:
      - foobar.com
      - '*.foobar.com'
```

## Configuration
- `domains {array}`
    - **required**
    - An array of domain names to add to your certificate
- `profile {string}`
    - **default** `provider.profile || process.env.AWS_PROFILE`
    - An AWS profile to use when creating the certificate
- `region {string}`
    - **default** `provider.region || process.env.AWS_REGION || 'us-east-1'`
    - The region to create your certificate in
    
## Commands
### `sls create-cert`
Creates a certificate for the domains in your configuration if they are not already attached to
other certificates.

-----

### `sls get-cert --arn [certificate arn]`
Prints a JSON object result of `describeCertificate` for the given arn

### Options
- `arn {string}`
    - The certificate ARN to describe
    
-----

### `sls has-valid-certs`
Checks to see if your list of domains has valid certificates attached to them

-----

### `sls is-cert-valid --arn [certificate arn]`
Checks whether or not a particular certificate is valid

### Options
- `arn {string}`
    - The certificate ARN to check the validity of