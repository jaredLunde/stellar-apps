import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Broker from 'react-broker'
import App from './index'

if (process.env.STAGE && process.env.STAGE === 'production') {
  require('./robots.txt')
}

if (process.env.STAGE && process.env.STAGE !== 'production') {
  require('./robots.disallow.txt')
}

const beautifyConfig = {
  indent_size: 2,
  html: {
    end_with_newline: true,
    indent_scripts: 'keep',
    preserve_newlines: true,
    inline: [],
    eol: '\n',
    wrap_attributes: 'aligned-multiple',
    wrap_attributes_indent_size: 2,
    wrap_line_length: 120,
    content_unformatted: ['script', 'style'],
    extra_liners: [],
  }
}

const minifyConfig = {
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  // conservativeCollapse: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  sortAttributes: true,
  sortClassName: true,
  quoteCharacter: `'`,
  minifyJS: false
}

async function render (locals) {
  if (process.env.STAGE && process.env.STAGE !== 'development') {
    locals.clientStats = require(`../dist/${process.env.STAGE}/client/stats.json`)
  }
  // keeps track of lazy chunks used by the current page
  const chunkCache = Broker.createChunkCache()
  // provided to react-helmet-async
  const helmetContext = {}
  // creates the App in React
  const app = React.createElement(App, {helmetContext, chunkCache, ...locals})
  // preloads the async components and when done renders the app string
  await Broker.loadAll(app)
  // the string-rendered application
  const page = ReactDOMServer.renderToString(app)
  // renders the Helmet attributes
  const {helmet} = helmetContext
  // returns the document
  let html = `
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
        ${chunkCache.getChunkScripts(locals.clientStats)}
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

  // prettifies the output in dev for better debugging
  if (process.env.NODE_ENV !== 'production') {
    html = require('js-beautify').html(html, beautifyConfig)
  }

  // minifies in production
  if (process.env.NODE_ENV === 'production') {
    html = require('@stellar-apps/html-minifier').minify(html, minifyConfig)
  }

  return html
}

export default !process.env.STAGE || process.env.STAGE === 'development'
  ? ({clientStats}) => (req, res, next) => render({clientStats, path: req.path})
  : render