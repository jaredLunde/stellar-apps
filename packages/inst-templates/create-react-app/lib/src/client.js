import React from 'react'
import ReactDOM from 'react-dom'
import Broker from 'react-broker'
import App from './index'


const root = document.getElementById('⚛️')

async function render (App) {
  if (process.env.NODE_ENV === 'production') {
    await Broker.loadInitial()
  }

  return ReactDOM.render(<App/>, root)
}

if (__DEV__) {
  module.hot && module.hot.accept('./index', () => render(require('./index').default))
}

render(App)
