import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'


// preloads all of the queries used in the current react tree
export class RenderPromises {
  // Map from Query component instances to pending promises.
  chunkPromises = []

  load () {
    return Promise.all(this.chunkPromises).then(() => this.chunkPromises = [])
  }
}

export default function load (app, render = renderToStaticMarkup) {
  const renderPromises = new RenderPromises()

  class RenderPromisesProvider extends React.Component {
    static childContextTypes = {
      renderPromises: PropTypes.object,
    }

    getChildContext () {
      return {renderPromises}
    }

    render () {
      return app
    }
  }

  function process () {
    const html = render(<RenderPromisesProvider/>)
    return renderPromises.chunkPromises.length > 0
      ? renderPromises.load().then(process)
      : html
  }

  return Promise.resolve().then(process)
}
