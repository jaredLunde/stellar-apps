# @stellar-apps/serverless-deploy-client-bundle
A Serverless plugin that bundles your client-side code with Webpack and uploads it to an 
S3 bucket. This was built to be used with React SSR lambda functions, but may have additional 
uses.

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
          key: 'customized/[file].key[ext]'
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

## Configuring the [`AWS.S3`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property) constructor
The configuration for `custom.deployClientBundle.s3` has five special properties: `object`,
`credentials`, and `bucket`. Every other parameter provided to the configuration will be delivered
to the `AWS.S3()` constructor as is.

See the [S3() API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property) for
a complete list of parameters.
```yaml
custom:
  deployClientBundle:
    s3:
      maxRetries: 3
```

## Commands
### `sls create-bucket`
Creates your S3 bucket if it doesn't exist. This is also fired each time your service is deployed,
but not when individual functions are deployed.

#### Configuring
Location in config: `custom.deployClientBundle.s3.bucket`

There are two special properties for this configuration: `name` and `corsRules`. Any other
property is added to the `params` of the `createBucket()` API in the `aws-sdk`.

See the [createBucket() API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createBucket-property)
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

-----

### `sls build-client`
This command builds your client bundle in Webpack. 

#### Configuring
Location in config: `custom.deployClientBundle.webpack` 

#### Parameters
- `config {string}`
    - **default** `webpack.config.js`
    - The path of your Webpack configuration file relative to the `serverless.yml` of your
      service.
- `statsFile {string}`
    - **default** `stats.json`
    - Every time you build your bundle a `stats.json` file is written to the `output.path` in
      your `webpack.config.js` containing the `clientStats` Webpack object from your build.
      `stats.json` only contains `publicPath`, `chunks`, and `assets` properties from the stats
      object but `stats.all.json` contains all of the properties.
    
-----

### `sls upload-client`
This command uploads your client bundle to S3. Any assets emitted by your Webpack compilation will
be uploaded by this command unless `custom.deployClientBundle.s3.object.[glob].exclude` is `true`.

The upload process is highly granular. With glob matching you can attach specific parameters
and metadata to individual files or file types with ease. 

#### Configuring
Location in config: `custom.deployClientBundle.s3.object`

#### Parameters
Parameter groups are determined via [glob patterns](https://github.com/motemen/minimatch-cheat-sheet#minimatch-cheat-sheet) 
defined in `custom.deployClientBundle.s3.object`, where a pattern of `*` is applied to all files. The config for each 
glob is deep merged in the order they appear in the `serverless.yml`, top-down. The merging algorithm can be seen 
[here](https://github.com/TehShrike/deepmerge#example-usage).

- `key {string}`
    - **default** `[filename]`
    - A pattern-based string which allows you to further customize where your files wind up in your
      S3 bucket.
    - *Patterns*
        - `[filename]`
            - The filename emitted by Webpack
        - `[file]`
            - The name of the file without its extension
        - `[ext]`
            - The file extension
        - `[basename]`
            - The `file` and the `ext` without a directory name
        - `[dirname]`
            - The `filename` without a `basename`
        - `[publicPath]`
            - The public path defined in your Webpack configuration
- `exclude {bool}`
    - If `true` any file matching this glob will not be uploaded to S3
- `params {object}`
    - The `params` object sent in [`S3.upload()`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property)
    - Any parameter defined in the `S3.upload()` API can be defined here.
    - **defaults**
        - `bucket`
            - The bucket name defined in `custom.deployClientBundle.s3.bucket`
        - `key`
            - The `key` pattern filled from the `key` parameter above
        - `contentType`
            - By default this command fills in the `contentType` for you 
              via [`mime.getType()`](https://github.com/broofa/node-mime#mimegettypepathorextension)
              You can override the default by providing your own `contentType`

#### Example
In this example all javascript files are provided parameters for `**/*.js` and `*`. All other
files are only provided with parameters for `*`.

```yaml
custom:
  deployClientBundle:
    s3:
      object:
        '**/*.js':
          # file, filename, basename, dirname, publicPath, ext
          key: '[filename]'
          params:
            ACL: 'public-read'
            contentType: 'application/javascript'
            cacheControl: 'public, immutable, max-age=31536000'
        '*':
          params:
            # This key would override the key in '**/*.js'
            key: '[filename].dryrun'
            metadata:
              serverless-deploy-client-bundle: yes
```

-----

### `sls deploy-client`
This command builds your client bundle and then uploads it to S3. It is fired each time your
service or any function within it are deployed. See `sls build-client` and `sls upload-client`
for information about the individual commands this one executes.
