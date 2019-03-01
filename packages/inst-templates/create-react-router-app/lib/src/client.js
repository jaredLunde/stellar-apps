import React from 'react'
import ReactDOM from 'react-dom'
import {Router} from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'
import Broker from 'react-broker'
import App from './index'


const history = createHistory()
const root = document.getElementById('⚛️')
const hydrate = App => ReactDOM.hydrate(<Router history={history} children={<App/>}/>, root)

if (__DEV__) {
  module.hot && module.hot.accept('./index', () => hydrate(require('./index').default))
}

Broker.loadInitial().then(() => hydrate(App))
