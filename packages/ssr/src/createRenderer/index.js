import {send} from 'micro'


export withCookieParser from 'micro-cookie'
const robotsCache = {}
export function withRobotsTxt (robots) {
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
}

// this creates an http handler
export default function createRenderer(
  // function which generates the HTML markup for the app
  render,
  // callback for returning error pages
  renderError
) {
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

    try {
      // sends the request with micro
      const html = await render({
        // express
        req,
        res,
        // environments
        device: getDevice(req.headers),
        env: process.env.NODE_ENV || 'development',
        stage: process.env.STAGE || 'development'
      })
      // sends the response body via micro
      send(res, res.statusCode || 200, html)
    }
    catch (err) {
      // handles any errors encountered in the rendering process
      console.log('[Error]', err)
      const statusCode =
        res.statusCode === 200 || res.statusCode === void 0 ? 500 : res.statusCode
      // returns a custom error page if there is one, otherwise just the
      // error message
      send(res, statusCode, renderError ? renderError(res.statusCode, err) : err)
    }
  }
}
