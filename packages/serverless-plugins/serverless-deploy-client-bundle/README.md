# @stellar-apps/serverless-deploy-client-bundle
A Serverless plugin that bundles your client-side code with Webpack then uploads it to your
public S3 bucket. This was built to be used with React SSR lambda functions, but may
have additional uses.

## Installation
`yarn add @stellar-apps/serverless-deploy-client-bundle`

## Usage
```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-deploy-client-bundle
 
custom:
  deployClientBundle:
    s3:
      maxRetries: 5
      bucket:
        name: test-stellar-public-0
        corsRules:
          - allowedOrigins:
              - '*'
            allowedHeaders:
              - '*'
            allowedMethods:
              - GET
            exposeHeaders:
              - x-amz-server-side-encryption
              - x-amz-request-id
            maxAgeSeconds: 86400
      object:
        '**/*.js':
          # file, filename, basename, dirname, publicPath, ext
          key: '[filename]'
          params:
            contentType: 'auto'
            cacheControl: 'public, immutable, max-age=31536000'
        '*':
          params:
            ACL: 'public-read'
```
## Configuring AWS credentials
By default credentials are read through the `provider.profile` property in your config. If that
property doesn't exist or is different than the credentials you'd like to configure for setting up
your bucket, they can be configured through `custom.deployClientBundle.s3.credentials`

#### Parameters
- `profile {string}`
    - Your AWS profile in `~/.aws/credentials`
To use credentials without a `profile` set the params below
- `accessKeyId {string}`
    - The AWS access key ID
- `secretAccessKey {string}`
    - The AWS secret access key

#### Example
```yaml
custom:
  deployClientBundle:
    s3:
      credentials:
        profile: stellar-s3
```

## Commands
### `sls create-bucket`
Creates your S3 bucket if it doesn't exist. This is also fired each time your service is deployed,
but not when individual functions are deployed.

#### Configuring
Location in config: `custom.deployClientBundle.s3.bucket`
There are two special properties for this configuration: `name` and `corsRules`. Any other
property is added to the `params` of the `createBucket()` API in the `aws-sdk`.

See the [https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createBucket-property](API)
for more parameters.

#### Parameters
- `name {string}`
    - The name of your S3 bucket
- `corsRules {array}`
    - See [putBucketCors()](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putBucketCors-property)
      for parameters
      
#### Example
```yaml
custom:
  deployClientBundle:
    s3:
      bucket:
        name: test-stellar-public-0
        corsRules:
          - allowedOrigins:
              - '*'
            allowedHeaders:
              - '*'
            allowedMethods:
              - GET
            exposeHeaders:
              - x-amz-server-side-encryption
              - x-amz-request-id
            maxAgeSeconds: 86400
```

### `sls build-client`
### `sls upload-client`
### `sls deploy-client`