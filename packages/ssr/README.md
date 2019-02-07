# @stellar-apps/ssr
Utility functions for rendering and serving React apps from the server-side with [`micro`](https://github.com/zeit/micro)

## Installation
`yarn add @stellar-apps/ssr`

## Usage
### createRenderer example
```js
import App from './App'
import createRenderer, {withRobots, withCookies, pipe} from '@stellar-apps/ssr/createRenderer'

const robots = `
User-agent: *
Disallow: /
`

const renderApp = ({clientStats}) => async function render ({
  // micro
  req,
  res,
  // environments
  device,
  env,
  stage
}) {
  // creates the App in React
  const app = React.createElement(App, {req, res, device, env, stage})
  // the string-rendered application
  const page = ReactDOMServer.renderToString(app)
  // returns the document
  return  `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Simplest example</title>
      </head>
      <body>
        <noscript>
          <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
            Javascript must be enabled in order to view this website
          </div>
        </noscript>
        <div id="⚛️">${page}</div>
      </body>
    </html>
  `
}


const middleware = pipe(withRobots(robots), withCookies)
export default ({clientStats}) => {
  const serverRenderer = createRenderer(renderApp({clientStats}))
  return middleware(serverRenderer)
}
```

-----

### startRenderer example
#### start in `developement`
`NODE_ENV=development node scripts/startSsr.js`

#### start in `production`
`NODE_ENV=production node scripts/startSsr.js`

#### `scripts/startSsr.js`
```js
const startRenderer = require('@stellar-apps/ssr/startRenderer')

startRenderer({
  clientConfig: require('../config/client/webpack.development'), // webpack client config
  serverConfig: require('../config/server/webpack.development'), // webpack server config
  publicAssets: '../../public',                                  // path to local public assets
})
```

-----

### `createRenderer(render <func>, renderError <func>)`
### Arguments
- `render(<options>)`
  - `options` `{object}`
    - `req` `{object}`
        - Node HTTP server request object
    - `res` `{object}`
        - Node HTTP server response object
    - `device` `{string}`
        - **default** `desktop`
        - Device type based on Cloudfront headers when this is rendered in AWS Lambda
        - One of `desktop`, `tablet`, `mobile`, `desktop`
- `renderError(<options>)`
   - `options` `{object}`
    - Takes all of the above options and:
    - `err` `{object}`
        - The error object that was caught when the error was thrown

-----
  
### `withRobots(robots <string>)`
Middleware for injecting a `robots.txt` file at `/robots.txt`
### Arguments
- `robots` `{string}`
    - A string containing your `robots.txt` content

-----

### `withCookies(keygrip <array|object>)`
Middleware for injecting cookie get/set into the `req` object at `req.cookies`.
See [`cookies`](https://github.com/pillarjs/cookies) for further documentation.

### Arguments
- `keygrip` `{array|object}`
    - [An array of keys or Keygrip object](https://www.npmjs.com/package/keygrip)
-----

### `startRenderer(options <object>)`
Starts a server side renderer using `micro` and `webpack-dev-server` in `development` mode.

### Arguments
- `options` `{object}`
    - `clientConfig` `{object}`
        - Webpack client configuration object
    - `serverConfig` `{object}`
        - Webpack server configuration object
    - `publicAssets` `{string}`
        - Path to local public assets that are otherwise not defined in your
          Webpack emitted assets
    - `silent` `{bool}`
        - **default** `false`
        - Silences `micro` from emitting outputs
    - `limit` `{string}`
        - **default** `1mb`
        - Size limit for emitted outputs
    - `host` `{string}`
        - **default** `::`
        - The host name to bind the `micro` server too
    - `port` `{number}`
        - **default** `3000`
        - If the port is already in use, a unique one will be assigned.
 
 ### Environments
 This renderer uses `micro` when `process.env.NODE_ENV === 'production'` and `micro-dev` when
 in `development`. To force the renderer to use `micro-dev` in production you can provide the 
 environment variable `SSR_DEBUG=true` 