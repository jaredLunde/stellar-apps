import createRenderer, {noFavicon, withRobots, withCookies, pipe} from '@stellar-apps/ssr/createRenderer'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Broker from 'react-broker'
import App from './index'


export const renderApp = ({clientStats}) => async function render (
  {
    // micro
    req,
    res,
    // environments
    device,
    env,
    stage
  }
) {
  // keeps track of lazy chunks used by the current page
  const chunkCache = Broker.createChunkCache()
  // provided to react-helmet-async
  const helmetContext = {}
  // creates the App in React
  const app = React.createElement(
    App,
    {
      chunkCache,
      userAgent: req.headers['user-agent'],
      clientStats,
      device,
      env,
      stage,
      helmetContext
    }
  )
  // preloads the async components and when done renders the app string
  await Broker.loadAll(app)
  // the string-rendered application
  const page = ReactDOMServer.renderToString(app)
  // renders the Helmet attributes
  const {helmet} = helmetContext
  // returns the document
  return `
    <!DOCTYPE html>
    <html ${helmet.htmlAttributes}>
      <head>
        <!-- Page Title -->
        ${helmet.title}
        <!-- Helmet meta -->
        ${helmet.meta}
        <!-- Helmet links -->
        ${helmet.link}
        <!-- Helmet styles -->
        ${helmet.style}
        <!-- Bundle scripts -->
        ${chunkCache.getChunkScripts(clientStats)}
        <!-- Helmet scripts -->
        ${helmet.script}
      </head>
      <body ${helmet.bodyAttributes}>
        <noscript>
          <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
            Javascript must be enabled in order to view this website
          </div>
        </noscript>
        <div id="⚛️">${page}</div>
      </body>
    </html>
  `.trim()
}

// Sets up robots.txt middleware for micro
const robots = withRobots(
  __STAGE__ !== 'production' ? require('./robots.disallow.txt') : require('./robots.txt')
)

// creates a middleware pipe for micro
const middleware = pipe(robots, withCookies)

// this is the server renderer that will handle all requests
const serverRenderer = clientStats => middleware(createRenderer(renderApp({clientStats})))

// sets up options for the Serverless lambda function
let clientStats, mainServerless
if (__STAGE__ !== 'development') {
  clientStats = require(`../dist/${__STAGE__}/client/stats.json`)
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