// Lifted from https://github.com/apollographql/react-apollo/blob/master/src/getDataFromTree.ts
// and adapted for seamless use with react-broker
import React from 'react'
import PropTypes from 'prop-types'


function makeDefaultQueryInfo () {
  return {
    seen: false,
    observable: null,
  }
}

export class RenderPromises {
  // Map from Query component instances to pending fetchData promises.
  queryPromises = new Map()
  queryInfoTrie = new Map()
  // Keeps track of chunk promises for react-broker
  chunkPromises = []

  // Registers the server side rendered observable.
  registerSSRObservable (queryInstance, observable) {
    this.lookupQueryInfo(queryInstance).observable = observable
  }

  // Get's the cached observable that matches the SSR Query instances query and variables.
  getSSRObservable (queryInstance) {
    return this.lookupQueryInfo(queryInstance).observable
  }

  addQueryPromise (queryInstance, finish) {
    const info = this.lookupQueryInfo(queryInstance)

    if (!info.seen) {
      this.queryPromises.set(
        queryInstance,
        new Promise(resolve => {
          resolve(queryInstance.fetchData())
        }),
      )

      return null
    }

    return finish()
  }

  hasPromises () {
    return this.queryPromises.size > 0 || this.chunkPromises.length > 0
  }

  loadPromises () {
    this.queryPromises.forEach((promise, queryInstance) => {
      this.lookupQueryInfo(queryInstance).seen = true
      this.chunkPromises.push(promise)
    })
    
    return Promise.all(promises).then(() => {
      this.queryPromises.clear()
      this.chunkPromises = []
    })
  }

  lookupQueryInfo (queryInstance) {
    const {queryInfoTrie} = this
    const {query, variables} = queryInstance.props
    const varMap = queryInfoTrie.get(query) || new Map()

    if (!queryInfoTrie.has(query)) queryInfoTrie.set(query, varMap)
    const variablesString = JSON.stringify(variables)
    const info = varMap.get(variablesString) || makeDefaultQueryInfo()
    if (!varMap.has(variablesString)) varMap.set(variablesString, info)

    return info
  }
}

export default function getMarkupFromTree (
  {
    tree,
    context = {},
    renderFunction = require('react-dom/server').renderToStaticMarkup,
  }
) {
  const renderPromises = new RenderPromises()
  const waitForPromises = renderPromises

  class RenderPromisesProvider extends React.Component {
    static childContextTypes = {
      waitForPromises: PropTypes.object,
      renderPromises: PropTypes.object,
    }

    getChildContext () {
      return {...context, waitForPromises, renderPromises}
    }

    render () {
      return tree
    }
  }

  Object.keys(context).forEach(key => {
    RenderPromisesProvider.childContextTypes[key] = PropTypes.any
  })

  function process () {
    const html = renderFunction(React.createElement(RenderPromisesProvider))
    return renderPromises.hasPromises()
      ? renderPromises.loadPromises().then(process)
      : html
  }

  return Promise.resolve().then(process)
}
