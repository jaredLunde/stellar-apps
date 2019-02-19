import React from 'react'
import ReactDOM from 'react-dom'
import {Router} from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'
import Broker from 'react-broker'
import App from './index'


const history = createHistory()
const root = document.getElementById('⚛️')

async function render (App) {
  const app = <Router history={history} children={<App/>}/>
  await Broker.loadInitial()
  return ReactDOM.render(app, root)
}

if (__DEV__) {
  module.hot && module.hot.accept('./index', () => render(require('./index').default))
}

render(App)
