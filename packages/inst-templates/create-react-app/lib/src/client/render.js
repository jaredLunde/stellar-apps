import React from 'react'
import ReactDOM from 'react-dom'
import Broker from 'react-broker'
import App from '../App'


const root = document.getElementById('⚛️')

async function render (App) {
  await Broker.loadAll(App)
  return ReactDOM.render(<App/>, root)
}

if (__DEV__) {
  module.hot && module.hot.accept('../App', () => render(require('../App').default))
}

render(App)
