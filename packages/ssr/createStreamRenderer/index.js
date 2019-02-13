'use strict'

exports.__esModule = true
var _exportNames = {}
exports.default = createStreamRenderer

var _createRenderer = require('../createRenderer')

Object.keys(_createRenderer).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  exports[key] = _createRenderer[key]
})

var _micro = require('micro')

// this creates an http handler
function createStreamRenderer( // function which generates the HTML markup for the app
  render, // callback for returning error pages
  renderError = _createRenderer.defaultRenderError
) {
  return async function handler(req, res) {
    // we will always be returning HTML from this server
    res.setHeader('Content-Type', 'text/html') // performance enhancement for SSL via caching

    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubdomains; preload'
    ) // a feature of Internet Explorer, Chrome and Safari that stops pages
    // from loading when they detect reflected cross-site scripting (XSS)
    // attacks

    res.setHeader('X-XSS-Protection', '1; mode=block') // fixes caching issues when using gzip compression

    res.setHeader('Vary', 'Accept-Encoding') // friendly variables for rendering

    const device = (0, _createRenderer.getDevice)(req.headers)
    const env = process.env.NODE_ENV || 'development'
    const stage = process.env.STAGE || 'development'

    try {
      // sends the request with micro
      await render({
        // micro
        req,
        res,
        // environments
        device,
        env,
        stage,
      })
    } catch (err) {
      let html

      if (res.statusCode >= 300 && res.statusCode < 400) {
        // handles redirections
        return res.end()
      } else {
        // gets rendered error
        res.statusCode =
          res.statusCode === 200 || res.statusCode === void 0
            ? 500
            : res.statusCode
        html = renderError
          ? await renderError({
              req,
              res,
              err,
              device,
              env,
              stage,
            })
          : err
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(err)
      }

      ;(0, _micro.send)(res, html, res.statusCode, html)
    }
  }
}
