import createRenderer, {withRobots, withCookies, pipe} from '@stellar-apps/ssr/createRenderer'
import renderApp from './renderApp'

// Sets up robots.txt middleware for micro
const robots = withRobots(
  __STAGE__ !== 'production'
    ? require('./templates/robots.disallow.txt')
    : require('./templates/robots.txt')
)
// creates a middleware pipe for micro
const middleware = pipe(robots, withCookies)
// this is the server renderer that will handle all requests
const serverRenderer = clientStats =>
  middleware(
    createRenderer(
      renderApp({clientStats})
    )
  )

// sets up options for the Serverless lambda function
let clientStats, mainServerless
if (__STAGE__ !== 'development') {
  clientStats = require(`../../dist/${__STAGE__}/client/stats.json`)
  mainServerless = require('serverless-http')(serverRenderer({clientStats}))
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
export default serverRenderer