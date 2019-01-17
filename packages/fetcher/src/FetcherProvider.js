import React from 'react'
import FetcherContext from './FetcherContext'
import createCache from './createCache'


const defaultCache = createCache()

export default class FetcherProvider extends React.Component {
  static propTypes = {
    cache: PropTypes.object
  }

  static defaultProps = {
    cache: defaultCache
  }

  state = {
    cache: null
  }

  static getDerivedStateFromProps (props, state) {
    if (props.cache !== state.cache) {
      return {
        cache: props.cache,
        fetch: props.fetch || (typeof window !== void 0 ? window.fetch.bind(window) : void 0)
      }
    }

    return null
  }

  render () {
    return <FetcherContext.Provider value={this.state} children={this.props.children}/>
  }
}