# @stellar-apps/serverless-sync-bundle
A Serverless plugin that bundles your application with Webpack and uploads it to an 
S3 bucket. This was built to be used with React SSR lambda functions, but may have additional 
uses.

## Installation
`yarn add --dev @stellar-apps/serverless-sync-bundle`

## Usage
```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-sync-bundle
 
custom:
  syncBundle:
    params:
      maxRetries: 5
    bucket: 
      name: test-stellar-public-0
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
your bucket, they can be configured through `custom.syncBundle.credentials`

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
  syncBundle:
    credentials:
      profile: stellar-s3
```

## Configuring the [`AWS.S3`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property) constructor
Location in config: `custom.syncBundle.params`

See the [S3() API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property) for
a complete list of parameters.
```yaml
custom:
  syncBundle:
    params:
    maxRetries: 3
```

## Commands
### `sls bundle`
This command bundles your application with Webpack. 

#### Configuring
Location in config: `custom.syncBundle.webpack` 

#### Parameters
- `config {string}`
    - **default** `webpack.config.js`
    - The path of your Webpack configuration file relative to the `serverless.yml` of your
      service.
    
-----

### `sls sync-bundle`
This command uploads your bundle to S3. Any assets emitted by your Webpack compilation will
be uploaded by this command unless `custom.syncBundle.object.[glob].exclude` is `true`.

The upload process is highly granular. With glob matching you can attach specific parameters
and metadata to individual files or file types with ease. 

#### Configuring
Location in config: `custom.syncBundle.object`

#### Parameters
Parameter groups are determined via [glob patterns](https://github.com/motemen/minimatch-cheat-sheet#minimatch-cheat-sheet) 
defined in `custom.syncBundle.object`, where a pattern of `*` is applied to all files. The config for each 
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
- `exclude {bool}`
    - If `true` any file matching this glob will not be uploaded to S3
- `params {object}`
    - The `params` object sent in [`S3.upload()`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property)
    - Any parameter defined in the `S3.upload()` API can be defined here.
    - **defaults**
        - `bucket`
            - The bucket name defined in `custom.syncBundle.bucket.name`
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
  syncBundle:
    'webpack.config.js':
      bucket: 
        name: 'my-bucket'
      object:
        '**/*.js':
          # file, filename, basename, dirname, ext
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
              serverless-sync-bundle: yes
```

