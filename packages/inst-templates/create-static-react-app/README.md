# @stellar-apps/create-static-react-app
This is an [`inst`](https://github.com/jaredLunde/inst-pkg) template for launching
static hosted React apps on S3 + CloudFront with custom domains.

## Installation
This assumes you've already created an `inst` workspace with `inst init [workspace]`
```bash
cd my-workspace
yarn inst @stellar-apps/create-static-react-app
```

## Installation options
- `Name`
    - The name of the package you're creating
- `AWS Profile`
    - The name of the AWS profile in your `~/.aws/credentials` file that you'd like to use
      to deploy this application
- `Domain name [production]`
    - The domain name to launch the `production` version of your static app on
- `Website S3 bucket [production]`
    - **default** `[value of production Domain name]`
    - The name of the bucket to deploy the static site (HTML files, robots.txt, etc.) into.
- `Client S3 bucket [production]`
    - **default** `[Name]-public`
    - The name of the bucket to deploy your client JS, images, etc. into. These are resources
      that are external to your static application, as in, not HTML files, robots.txt, etc.
- `Domain name [staging]`
    - **default** `staging-[Domain name]` if `[Domain name]` is a subdomain, otherwise 
      `staging.[Domain name]`
    - The domain name to launch the `staging` version of your static app on
- `Website S3 bucket [staging]`
    - **default** `[value of staging Domain name]`
    - See `production` above for description
- `Client S3 bucket [staging]`
    - **default** `[value of production Client S3 bucket with '-public' replaced by '-staging-public']`
    - See `production` above for description
- `Inherits code from`
    - Use the spacebar and arrow keys to select libraries already part of your Workspace to inherit code from, 
      e.g. a `core` or `shared` directory. You will then be able to import these libraries into your application
      via the alias `~[library name]` e.g. `import {Header} from '~core'`   

## Configuring CloudFormation
You should pay special attention to these values in `serverless.yml` ***EVERY TIME*** you create a new app 
from this template. This should be the ***FIRST THING*** you do after you create an app.

1. The default template assumes you're using a unique bucket for the public client assets of 
this application. If you're using a shared bucket that already exists, be sure to delete
the `resources.Resources.ClientS3Bucket` section of the `serverless.yml` that gets generated.

2. The default behavior for client buckets is to `retain` them on `teardown` so as not to 
accidentally empty a bucket that is in use by other applications. To change this behavior,
assuming your bucket is unique, you can change the option for `retain` to `false` in 
`custom.syncBundle['webpack/client.config.js'].bucket` and comment out 
`resources.Resources.ClientS3Bucket.DeletionPolicy`.

3. The default behavior for managing ACM certificates is to `retain` them on `teardown`. This is
to prevent encountering errors when you try to remove certificates that are still in use by
other applications, e.g. wildcard certificates. To change this behavior, set `retain` to `false`
in `custom.certificateManager.retain`

4. Pay special attention to the `custom.certificateManager.domains` listed to be sure they are
exactly the domains you need a certificate for and that they will use the exact same certificate.

## Managing the application
### Starting the app in the `development` stage and `development` NODE_ENV on a local server
```bash
cd my-workspace
yarn my-app start
```

### Starting the app in the `development` stage and `production` NODE_ENV on a local server
```bash
cd my-workspace
yarn my-app start production
```

### Deploying the CloudFormation stack to `staging` stage
**Note:** You have to use this command before using `deploy` without a `--stack` flag
```bash
cd my-workspace
yarn my-app deploy --stack
```

### Deploying the CloudFormation stack to `production` stage
**Note:** You have to use this command before using `deploy production` without a `--stack` flag
```bash
cd my-workspace
yarn my-app deploy production --stack
```

### Deploying the application without changing the CloudFormation stack to `staging` stage
```bash
cd my-workspace
yarn my-app deploy
```

### Deploying the application without changing the CloudFormation stack to `production` stage
```bash
cd my-workspace
yarn my-app deploy production
```

### Bundling the application without uploading the `staging` stage to S3
```bash
cd my-workspace
yarn my-app bundle
```

### Bundling the application without uploading the `production` stage to S3
```bash
cd my-workspace
yarn my-app bundle production
```

### Tearing down the `staging` CloudFormation stack
This removes your CloudFormation stack and all the resources defined within it. 
**Use with extreme caution.**
```bash
cd my-workspace
yarn my-app teardown
```

### Tearing down the `production` CloudFormation stack
This removes your CloudFormation stack and all the resources defined within it. 
**Use with extreme caution.**
```bash
cd my-workspace
yarn my-app teardown production
```