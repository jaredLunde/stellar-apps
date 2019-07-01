import {ApolloLink} from 'apollo-link'
import cookieParser from 'set-cookie-parser'


const responseHeaders = [
  'server-timing'
]

const forwardHeaders = (res, inputHeaders, acceptHeaders = responseHeaders) =>
  inputHeaders && inputHeaders.forEach((value, name) => {
    name = name.toLowerCase()

    if (acceptHeaders.indexOf(name) > -1) {
      // cookies need special handling because of the way express behaves
      // with set-cookie headers (it doesn't implicitly append)
      if (name === 'set-cookie') {
        cookieParser.parse(cookieParser.splitCookiesString(value)).forEach(
          ({name, value, maxAge, ...options}) => {
            name = name.trim()

            if (maxAge) {
              // has to be in ms when using express
              options.maxAge = maxAge * 1000
            }

            res.cookies.set(name, value, options)
          }
        )
      }
      else
        res.setHeader(name, value)
    }
  })

export default ({res, accept}) => new ApolloLink(
  (operation, forward) => forward(operation).map(
    response => {
      const {response: {headers}} = operation.getContext()

      if (headers)
        forwardHeaders(res, headers, accept)

      return response
    }
  )
)