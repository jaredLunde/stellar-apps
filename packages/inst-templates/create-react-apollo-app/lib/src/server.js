import createRenderer, {
  redirect,
  noFavicon,
  withRobots,
  withCookies,
  pipe
} from '@stellar-apps/ssr/createStreamRenderer'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Broker from 'react-broker'
import {StaticRouter} from 'react-router-dom'
import {ApolloProvider} from 'react-apollo'
import {createHttpLink} from 'apollo-link-http'
import {getMarkupFromTree} from '@stellar-apps/apollo'
import fetch from 'node-fetch'
import {
  createApolloClient,
  createRequestHeadersLink,
  createResponseHeadersLink,
  getCsrfHeaders
} from './apollo'
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
  // tracks redirections and status changes in the Router
  const routerContext = {}

  // creates the Apollo client
  const apolloClient = createApolloClient(
    createRequestHeadersLink({
      req,
      assign: async currentHeaders => Object.assign(
        currentHeaders,
        await getCsrfHeaders(
          {
            res,
            fetch,
            uri: process.env.APOLLO_CSRF_URI,
            cookie: currentHeaders.cookie,
          }
        )
      )
    }),
    createResponseHeadersLink({res}),
    createHttpLink({uri: process.env.APOLLO_URI, credentials: 'include', fetch}),
  )
  const app = (
    <ApolloProvider client={apolloClient}>
      <StaticRouter location={req.url} context={routerContext}>
        <App helmetContext={helmetContext} chunkCache={chunkCache} device={device}/>
      </StaticRouter>
    </ApolloProvider>
  )
  // preloads the async components from react-broker and waits for Apollo to execute
  // Queries and retrieve responses
  await getMarkupFromTree({
    tree: (
      <ApolloProvider client={apolloClient}>
        <StaticRouter location={req.url} context={routerContext}>
          <App helmetContext={helmetContext} chunkCache={chunkCache} device={device}/>
        </StaticRouter>
      </ApolloProvider>
    ),
    context: {},
    renderFunction: ReactDOMServer.renderToStaticMarkup
  })
  // sets the status from the router context to the response
  if (routerContext.status) {
    res.statusCode = routerContext.status
  }
  // somewhere a `<Redirect>` was rendered
  if (routerContext.url) {
    // redirect(res, routerContext.status || 301, routerContext.url)
    redirect(res, routerContext.url, routerContext.location?.state?.status || 301)
  }
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
        <!-- Initial Apollo state -->
        <script>
          window.__APOLLO_STATE__ = ${
    JSON.stringify(apolloClient.extract()).replace(/</g, '\\\u003c')
    }
        </script>
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