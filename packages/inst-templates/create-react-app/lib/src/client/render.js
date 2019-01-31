import React from 'react'
import ReactDOM from 'react-dom'
// This is disabled by default because there shouldn't be a flash on non-routed pages.
// import Broker from 'react-broker'
import App from '../App'


const root = document.getElementById('⚛️')

async function render (App) {
  // This is disabled by default because there shouldn't be a flash on non-routed pages.
  // await Broker.loadAll(App)
  return ReactDOM.render(<App/>, root)
}

if (__DEV__) {
  module.hot && module.hot.accept('../App', () => render(require('../App').default))
}

render(App)
