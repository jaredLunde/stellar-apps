import 'unfetch/polyfill/index.js'
import React from 'react'
import ReactDOM from 'react-dom'
import {Router} from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'
import Broker from 'react-broker'
import {ApolloProvider} from 'react-apollo'
import apollo from './apollo'
import App from './index'


const history = createHistory()
const apolloClient = apollo.createClient({fetch})
const root = document.getElementById('⚛️')

async function render (App) {
  const app = (
    <ApolloProvider client={apolloClient}>
      <Router history={history}>
        <App/>
      </Router>
    </ApolloProvider>
  )
  await Broker.loadAll(app)
  return ReactDOM.render(app, root)
}

if (__DEV__) {
  module.hot && module.hot.accept('./index', () => render(require('./index').default))
}

render(App)
