import {send, sendError} from 'micro'
import httpStatus from 'http-status'


export function pipe () {
  let x, val, fns = [].slice.call(arguments)

  return function piped () {
    for (x = 0; x < fns.length; x++) {
      val = x === 0 ? fns[x].apply(null, arguments) : fns[x](val)
    }

    return val
  }
}

export withCookies from 'micro-cookie'

const robotsCache = {}
export function withRobots (robots) {
  if (robotsCache[robots] === void 0) {
    robotsCache[robots] = next => (req, res) => {
      if ('/robots.txt' === req.url) {
        res.setHeader('Content-Type', 'text/plain')
        res.setHeader(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubdomains; preload'
        )
        res.setHeader('X-XSS-Protection', '1; mode=block')
        res.setHeader('Vary', 'Accept-Encoding')
        res.setHeader('Cache-Control', 'public, max-age=604800')
        send(res, 200, robots)
      }
      else {
        next(req, res)
      }
    }
  }

  return robotsCache[robots]
}

export const noFavicon = next => (req, res) => {
  if (req.url === '/favicon.ico') {
    send(res, 404, '')
  }
  else {
    next(req, res)
  }
}

function defaultRenderError ({res, req, err}) {
  const strErr = err.toString()
  const statusText = httpStatus[res.statusCode]
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${statusText}</title>
        <style> 
           body {
             background: #19181a; 
             padding: 2rem; 
             font-family: Hack, monospace;
           }
           body > div {
             margin: 0 auto;
             max-width: 720px;
           }
           pre, code {
             font-family: Menlo, Hack, monospace!important; 
             color: #a8aaa6; 
             font-size: 0.8rem;
             border-left: 4px solid #a8aaa6;
             padding-left: 1rem;
             margin: 0;
           }
           code {
             border: none; 
             padding: 0;
             font-size: 1.2rem;
             margin-bottom: 1rem;
             display: block;
           }
           h1 {
             font-size: 3rem;
             color: #ff5e54; 
             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
           }
           h1 span {
             display: block;
             font-size: 1.25rem;
             color: #a8aaa6;
             margin-bottom: 3rem;
           }
        </style>
      </head>
      <body>
        <div>
          <h1>Error <span>${res.statusCode} ${statusText}</span></h1>
          <code>${strErr.split('\n')[0]}</code>
          <pre>${strErr.split('\n').slice(1).join('\n')}</pre>
        </div>
      </body>
    </html>
  `
}

// guesses the device type from Cloudfront hints
function getDevice (headers) {
  if (headers['cloudfront-is-smarttv-viewer'] === 'true') {
    return 'desktop'
  }
  else if (headers['cloudfront-is-tablet-viewer'] === 'true') {
    return 'tablet'
  }
  else if (headers['cloudfront-is-mobile-viewer'] === 'true') {
    return 'mobile'
  }
  else if (headers['cloudfront-is-desktop-viewer'] === 'true') {
    return 'desktop'
  }

  return 'desktop'
}

const defaultBeautifyConfig = {
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

const defaultMinifyConfig = {
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

// this creates an http handler
export default function createRenderer(
  // function which generates the HTML markup for the app
  render,
  // callback for returning error pages
  renderError = defaultRenderError,
  // options for minify/beautify
  options = {}
) {
  const minify = options.minify || defaultMinifyConfig
  const beautify = options.beautify || defaultBeautifyConfig

  return async function handler (req, res) {
    // we will always be returning HTML from this server
    res.setHeader('Content-Type', 'text/html')
    // performance enhancement for SSL via caching
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubdomains; preload')
    // a feature of Internet Explorer, Chrome and Safari that stops pages
    // from loading when they detect reflected cross-site scripting (XSS)
    // attacks
    res.setHeader('X-XSS-Protection', '1; mode=block')
    // fixes caching issues when using gzip compression
    res.setHeader('Vary', 'Accept-Encoding')
    // friendly variables for rendering
    const device = getDevice(req.headers)
    const env = process.env.NODE_ENV || 'development'
    const stage = process.env.STAGE || 'development'
    let html

    try {
      // sends the request with micro
      html = await render({
        // micro
        req,
        res,
        // environments
        device,
        env,
        stage
      })

      res.statusCode = res.statusCode || 200
    }
    catch (err) {
      // gets rendered error
      res.statusCode =
        res.statusCode === 200 || res.statusCode === void 0 ? 500 : res.statusCode
      html = renderError ? (await renderError({req, res, err, device, env, stage})) : err
    }

    // prettifies the output in dev for better debugging
    if (process.env.NODE_ENV !== 'production') {
      html = beautify ? require('js-beautify').html(html, beautify) : html
    }

    if (process.env.NODE_ENV === 'production') {
      html = minify ? require('@stellar-apps/html-minifier').minify(html, minify) : html
    }

    // sends the response body via micro
    send(res, res.statusCode, html)
  }
}
