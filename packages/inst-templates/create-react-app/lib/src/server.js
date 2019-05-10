import createRenderer, {
  noFavicon,
  withRobots,
  withCookies,
  pipe
} from '@stellar-apps/ssr/createStreamRenderer'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import * as Broker from 'react-broker'
import App from './index'


export const renderApp = ({clientStats}) => async function render (
  {
    // micro server objects
    req,
    res,
    // user device type: mobile, table, desktop
    device
  }
) {
  // keeps track of lazy chunks used by the current page
  const chunkCache = Broker.createChunkCache()
  // provided to react-helmet-async
  const helmetContext = {}
  // creates the App in React
  const app = React.createElement(App, {helmetContext, chunkCache, device})
  // preloads all async components and fetcher queries
  await Broker.loadAll(app, ReactDOMServer.renderToStaticMarkup)
  // renders the Helmet attributes
  const {helmet} = helmetContext
  const chunks = chunkCache.getChunkScripts(clientStats, {preload: true})
  res.write(`
    <!DOCTYPE html>
    <html ${helmet.htmlAttributes}>
      <head>
        <!-- Preloads bundle scripts -->
        ${chunks.preload}
        <!-- Page Title -->
        ${helmet.title}
        <!-- Helmet meta -->
        ${helmet.meta}
        <!-- Helmet links -->
        ${helmet.link}
        <!-- Helmet styles -->
        ${helmet.style}
        <!-- Helmet scripts -->
        ${helmet.script}
      </head>
      <body ${helmet.bodyAttributes}>
        <noscript>
          <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
            Javascript must be enabled in order to view this website
          </div>
        </noscript>
        <div id="⚛️">
  `)
  // renders the app as a stream for HTTP streaming and reducing TTFB on services that
  // allow such things (not API Gateway as of this writing)
  const stream = ReactDOMServer.renderToNodeStream(app)
  stream.pipe(res, {end: false})
  // when React finishes rendering this sends the rest of the closing tags to the browser
  stream.on('end', () => {
    res.end(`
        </div>
        <!-- Bundle scripts -->
        ${chunks.scripts}
      </body>
    </html>
    `)
  })
}

// creates a middleware pipe for micro
const middleware = pipe(
  // 404s on favicon requests
  noFavicon,
  // Sets up robots.txt middleware for micro
  withRobots(
    process.env.STAGE === 'production'
      ? require('./robots.txt')
      : require('./robots.disallow.txt')
  ),
  // sets up cookies
  withCookies()
)

// this is the server renderer that will handle all requests
const serverRenderer = clientStats => middleware(createRenderer(renderApp({clientStats})))

// sets up options for the Serverless lambda function
let clientStats, mainServerless
if (process.env.STAGE !== 'development') {
  clientStats = require(`../dist/${process.env.STAGE}/client/stats.json`)
  mainServerless = require('serverless-http')(serverRenderer(clientStats))
}

// this is the export that Lambda calls as its handler
export const main = function (event, context) {
  // keeps the lambda function warm
  if (event.source === 'serverless-plugin-lambda-warmup') {
    console.log('Warming...')
    return
  }

  return mainServerless(event, context)
}

// by default this just exports the renderer
// this will be used by Webpack dev renderers
export default ({clientStats}) => serverRenderer(clientStats)