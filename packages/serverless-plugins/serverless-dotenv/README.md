# @stellar-apps/serverless-dotenv
A Serverless plugin that injects .env files into your serverless.yml based upon the
`provider.stage`.

By default, this plugin will assign all of the environment variables to each function
in your config. You can override this behavior with the `exclude` and `include` options 
below.

## Installation
`yarn add --dev @stellar-apps/serverless-dotenv`

## Usage
```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv
 
custom:
  dotenv:
    exclude: 
      - 'SERVERLESS*'
```

## Options
When both `include` and `exclude` options are defined `exclude` will take precedence over `include`. 
That is, you cannot define both at the same time.
- `path {string}`
    - **default** `.env.[--stage] || .env`
    - The path to your `.env` file relative to your `serverless.yml` file
    
- `exclude {array|object}`
    - An array of glob patterns which only exclude environment variables whose name match
      the glob

### Examples
Excludes all environment variables that start with `SERVERLESS` from all functions
```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv
 
custom:
  dotenv:
    exclude: 
      - 'SERVERLESS*'
```

Excludes all environment variables that start with `SERVERLESS` from the `main` function
```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv
 
custom:
  dotenv:
    exclude: 
      main: 
        - 'SERVERLESS*'
```
   
- `include {array|object}`
    - An array of glob patterns which only include environment variables whose name match
      the glob
  
### Examples
Includes all environment variables that start with `APP` in all functions
```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv
 
custom:
  dotenv:
    include: 
      - 'APP*'
```

Includes all environment variables that start with `APP` in the `main` function
```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv
 
custom:
  dotenv:
    include: 
      main: 
        - 'APP*'
```

### Example without `include` or `exclude`
```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv
```

## Credits
Inspiration and some code was derived from [serverless-dotenv-plugin](https://raw.githubusercontent.com/colynb/serverless-dotenv-plugin/master/index.js)