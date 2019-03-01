import React from 'react'
import ReactDOM from 'react-dom'
import Broker from 'react-broker'
import App from './index'


const root = document.getElementById('⚛️')
const hydrate = App => ReactDOM.hydrate(<App/>, root)

if (__DEV__) {
  module.hot && module.hot.accept('./index', () => hydrate(require('./index').default))
}

Broker.loadInitial().then(() => hydrate(App))
