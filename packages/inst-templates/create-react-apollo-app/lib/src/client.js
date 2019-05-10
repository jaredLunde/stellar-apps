import 'unfetch/polyfill/index.js'
import React from 'react'
import ReactDOM from 'react-dom'
import {Router} from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'
import {loadInitial} from 'react-broker'
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
const hydrate = App => ReactDOM.hydrate(
  <ApolloProvider client={apolloClient}>
    <Router history={history}>
      <App/>
    </Router>
  </ApolloProvider>,
  root
)

if (__DEV__) {
  module.hot && module.hot.accept('./index', () => hydrate(require('./index').default))
}

loadInitial().then(() => hydrate(App))
