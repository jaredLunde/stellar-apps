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
    webpackConfig: 'webpack.config.js'
    s3:
      bucket:
        ACL: 'public-read'
        name: test-stellar-public-0
        corsRules:
          - allowedOrigins:
              - 'https://bestellar.co'
            allowedHeaders:
              - '*'
            allowedMethods:
              - GET
            exposeHeaders:
              - x-amz-server-side-encryption
              - x-amz-request-id
            maxAgeSeconds: 86400
      maxRetries: 5
      # useAccelerateEndpoint: true
      credentials:
        profile: stellar-dev
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