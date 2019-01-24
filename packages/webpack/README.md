# @stellar-apps/webpack
Used for creating webpack configurations for Stellar apps with predefined `development`
and `production` configs.

The configs provided to the `createDevelopment` and `createProduction` functions are merged
to the default config in those functions and the default config in `createConfig`.

See the `src` code to view the default configs. 

This also comes packaged with a `startDevServer` function which creates a Webpack development
server with the provided `config`, `port`, and `webpack-dev-server` options.

## Installation
`yarn add @stellar-apps/webpack`

## Usage
```js
const {createDevelopment, createProduction} = require('@stellar-apps/webpack')

const myDevConfig = createDevelopment({
  ...devConfigs
})

const myProdConfig = createProduction({
  ...prodConfigs
})
```

### `startDevServer (options <Object>)`
- `options`
    - `config {obj}`
        - Webpack configuration object
    - `port {number}`
        - The port number to start the dev server on
    - `...opt`
        - Additional options which are provided to the `new DevServer()` constructor
        - See: https://webpack.js.org/configuration/dev-server/
        