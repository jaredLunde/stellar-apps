import {ApolloClient} from 'apollo-client'
import {InMemoryCache} from 'apollo-cache-inmemory'
import {from as linkFrom} from 'apollo-link'


export default function createApolloClient (...link) {
  return new ApolloClient({
    connectToDevTools: __CLIENT__ && process.env.STAGE !== 'production',
    ssrMode: __SERVER__,
    link: linkFrom(link),
    cache: new InMemoryCache().restore(
      typeof window === 'undefined' ? {} : window.__APOLLO_STATE__
    )
  })
}
