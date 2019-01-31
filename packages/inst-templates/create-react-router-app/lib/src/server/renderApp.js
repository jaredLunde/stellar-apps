import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Broker from 'react-broker'
import App from '../App'


export default ({clientStats}) => async function render (
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
