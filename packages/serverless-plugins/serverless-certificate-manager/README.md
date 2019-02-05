# @stellar-apps/serverless-certificate-manager
An ACM certificate manager which allows for certificate re-use and re-issuing outside the scope
of CloudFormation, while still acting in coalition with it. This plugin will automatically create 
your ACM certificates before your first deployment and wait for them to become valid before continuing 
your deployment. You can inject the resulting ARNs elsewhere in your config, i.e. a CloudFront distribution.
It will not run when individual functions are deployed.

## Installation
`yarn add --dev @stellar-apps/serverless-certificate-manager`

## Usage
```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-certificate-manager
 
custom:
  certificateManager:
    - retain: true
      domains:
        - foobar.com
        - '*.foobar.com'
    - refFor: resources.Resource.SomeAWSResource.AcmCertificateArn
      domains:
        - 'foobar.baz'
```

## Configuration
- `domains {array}`
    - **required**
    - An array of domain names to add to your certificate
- `retain {bool}`
    - **default** `false`
    - Retains the certificate on `sls remove` if `true`, otherwise the certificate is deleted
- `refFor {Array<string>}`
    - Object paths (`custom.bar.baz`) to properties in your Serverless configuration where you'd
      like the resulting certificate ARN to be injected. This is useful when sharing wildcard
      certificates between configurations where you don't want to lose the benefits of a pure
      CloudFormation implementation. These are injected on each `sls deploy`.
    - **Example**
 ```yaml
    certificateManager:
       - refFor:
          - resources.Resources.CloudFrontDistribution.Properties.ViewerCertificate.AcmCertificateArn
 ```
- `profile {string}`
    - **default** `provider.profile || process.env.AWS_PROFILE`
    - An AWS profile to use when creating the certificate
- `region {string}`
    - **default** `provider.region || process.env.AWS_REGION || 'us-east-1'`
    - The region to create your certificate in
    
## Commands
### `sls create-cert`
Creates certificates for the domains in your configuration if they are not already attached to
other certificates. Also injects the `refFor` properties into your config.

-----

### `sls get-cert`
Gets the JSON object result of `describeCertificate` attached to the domains in your 
configuration.

-----

### `sls remove-cert`
Deletes the certificates defined in your configuration where the `retain` property is not `true`

    
-----

### `sls has-valid-certs`
Checks to see if your configurations have valid certificates attached to them
