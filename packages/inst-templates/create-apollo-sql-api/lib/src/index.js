import express from 'express'
import cookies from 'cookie-parser'
import http from 'serverless-http'
import {ApolloServer, gql} from 'apollo-server-express'
import {knex} from './middleware/knex'
import {config as corsConfig} from './middleware/cors'
import * as middleware from './middleware'
import * as resolvers from './resolvers'

// Apollo Server
const server = new ApolloServer({
  // typeDefs is an array of graphql type definitions
  typeDefs: gql`
    type Query {
      hello: String!
    }
  `,
  // resolvers is an object shape of
  // {Query: {queryName: () => {}}, Mutation: mutationName: () => {}}
  resolvers,
  context: ({req, res}) => ({
    req,
    res,
    config: req.config,
    // viewer: req.viewer,
    // isLoggedIn: () => req.viewer && req.viewer.id.length > 0
  }),
  playground: !!__DEV__ && {
    tabs: [
      {
        endpoint: '/gql',
        query: `{hello}`,
        headers: {
          'x-bypass-csrf': 1
        }
      }
    ]
  }
})
// Express
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
app.get('/env', (req, res, next) => {
  if (__DEV__)
    res.json(config)
  else {
    res.status(404)
    next()
  }
})
// creates the default routes for the api
app.get('/ping/:pong', (req, res, next) => res.status(200).send(
  JSON.stringify({
    status: res.statusCode,
    body: req.params.pong
  })
))
app.get('/csrf', (req, res, next) => res.status(200).json({body: '🤙'}))
// binds the express app middleware to the Apollo server
server.applyMiddleware({app, path: '/gql', cors: corsConfig})
// wraps the app in a WSGI handler
const wsgi = http(app)
// exports the serverless function
export const main = async (event, context) => {
  // keeps the lambda function warm
  if (event.source === 'serverless-plugin-lambda-warmup') return
  // provides the request to express via a WSGI higher order function
  const result = await wsgi(event, context)
  // closes any DB connections
  if (knex)
    await knex.destroy()
  return result
}
