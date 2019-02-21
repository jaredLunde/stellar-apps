import 'unfetch/polyfill/index.js'
import React from 'react'
import ReactDOM from 'react-dom'
import {Router} from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'
import Broker from 'react-broker'
import {ApolloProvider} from 'react-apollo'
import {createHttpLink} from 'apollo-link-http'
import {createApolloClient, createRequestHeadersLink, getCsrfHeaders} from './apollo'
import App from './index'


const root = document.getElementById('⚛️')
const history = createHistory()
const httpLink = createHttpLink({fetch, uri: process.env.APOLLO_URI, credentials: 'include'})
const requestHeadersLink = createRequestHeadersLink({
  assign: async currentHeaders => Object.assign(
    currentHeaders,
    await getCsrfHeaders(
      {
        fetch,
        uri: process.env.APOLLO_CSRF_URI,
        cookie: currentHeaders.cookie,
      }
    )
  )
})
const apolloClient = createApolloClient(requestHeadersLink, httpLink)

async function render (App) {
  const app = (
    <ApolloProvider client={apolloClient}>
      <Router history={history}>
        <App/>
      </Router>
    </ApolloProvider>
  )

  if (process.env.NODE_ENV === 'production') {
    await Broker.loadInitial()
  }

  return ReactDOM.hydrate(app, root)
}

if (__DEV__) {
  module.hot && module.hot.accept('./index', () => render(require('./index').default))
}

render(App)
