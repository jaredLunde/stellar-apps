import emptyObj from 'empty/object'
import {ApolloClient} from 'apollo-client'
import {InMemoryCache} from 'apollo-cache-inmemory'
import {createHttpLink} from "apollo-link-http"
import {setContext} from 'apollo-link-context'
import {ApolloLink, from as linkFrom} from 'apollo-link'
import getCSRFHeaders from './getCSRFHeaders'


export default function createApolloClient ({
  res,
  config,
  fetch,
  forwardResponseHeaders,
  headers = emptyObj,
}) {
  const link = [
    // adds CSRF headers to requests
    setContext(
      async function (_, context) {
        const nextContext = {headers: {...context.headers, ...headers}}

        Object.assign(nextContext.headers, await getCSRFHeaders(
          fetch, {
            res,
            uri: config.csrfURI,
            cookie: nextContext.headers.cookie
          }
        ))

        return nextContext
      }
    ),
    // forwards response headers to Express on SSR requests
    typeof forwardResponseHeaders === 'function' && new ApolloLink(
      (operation, forward) => forward(operation).map(
        response => {
          const {response: {headers}} = operation.getContext()

          if (headers) {
            forwardResponseHeaders(headers, res)
          }

          return response
        }
      )
    ),
    createHttpLink({
      uri: config.uri,
      credentials: 'include',
      fetch
    })
  ]

  return new ApolloClient({
    connectToDevTools: __CLIENT__ && __STAGE__ !== 'production',
    ssrMode: __SERVER__,
    link: linkFrom(link.filter(link => link !== false)),
    cache: new InMemoryCache().restore(
      typeof window === 'undefined' ? {} : window.__APOLLO_STATE__
    )
  })
}
