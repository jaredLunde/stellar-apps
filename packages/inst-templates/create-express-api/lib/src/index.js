import express from 'express'
import cookies from 'cookie-parser'
import http from 'serverless-http'
import * as middleware from '~/middleware'

// initializes express
const app = express()
// disables x-powered-by: express header for security reasons
app.disable('x-powered-by')
// applies standard middleware
app.use(
  // parses JSON bodies
  express.json(),
  // cookie parser enabler
  cookies(),
  // applies user-defined middleware
  ...Object.values(middleware).filter(mw => typeof mw === 'function')
)

// creates the default routes for the api
app.get('/ping/:pong', (req, res, next) => res.status(200).send(
  JSON.stringify({
    status: res.statusCode,
    body: req.params.pong
  })
))
app.get('/csrf', (req, res, next) => res.status(200).json({body: '🤙'}))

// wraps the app in a WSGI handler
const wsgi = http(app)
// exports the serverless function
export const main = function (event, context) {
  // keeps the lambda function warm
  if (event.source === 'serverless-plugin-lambda-warmup') {
    return
  }
  // provides the request to express via a WSGI higher order function
  return wsgi(event, context)
}
