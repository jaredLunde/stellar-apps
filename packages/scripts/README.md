# @stellar-apps/scripts
A set of scripts for managing [BeStellar.co](https://BeStellar.co) apps 

## Installation
`yarn add @stellar-apps/scripts`

## Usage
```bash
# Starts dev server in apps that possess them
stellar-scripts start
stellar-scripts start production

# Deploys the application code
stellar-scripts deploy
stellar-scripts deploy production
# Deploys the application code and the complete CloudFormation stack
stellar-scripts deploy --stack
stellar-scripts deploy production --stack

# Bundles application code in applicable apps
stellar-scripts bundle
stellar-scripts bundle production

# Tears down the application stack
stellar-scripts teardown
stellar-scripts teardown production
```

### `stellar-scripts start [stage]`
Starts dev server in apps that possess them. See `stellar-scripts start --help` for options.

-----

### `stellar-scripts deploy [stage] [--stack]`
Deploys only the application code when `--stack` flag is not present, otherwise deploys the 
complete CloudFormation stack. See `stellar-scripts deploy --help` for options.

-----

### `stellar-scripts bundle [stage]`
Bundles application code in applicable apps. See `stellar-scripts bundle --help` for options.

-----

### `stellar-scripts teardown [stage]`
Tears down the application stack by running `serverless remove --stage [stage]`. 
See `stellar-scripts teardown --help` for options.

-----