import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'


// preloads all of the queries used in the current react tree
export class WaitForPromises {
  // Map from Query component instances to pending promises.
  chunkPromises = []

  load () {
    return Promise.all(this.chunkPromises).then(() => this.chunkPromises = [])
  }
}

export default function load (app, render = renderToStaticMarkup) {
  const waitForPromises = new WaitForPromises()

  class WaitForPromisesProvider extends React.Component {
    static childContextTypes = {
      waitForPromises: PropTypes.object,
    }

    getChildContext () {
      return {waitForPromises}
    }

    render () {
      return app
    }
  }

  function process () {
    const html = render(<WaitForPromisesProvider/>)
    return waitForPromises.chunkPromises.length > 0
      ? waitForPromises.load().then(process)
      : html
  }

  return Promise.resolve().then(process)
}
