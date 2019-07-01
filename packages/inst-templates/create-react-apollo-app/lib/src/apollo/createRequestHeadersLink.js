import {setContext} from 'apollo-link-context'


const forwardHeaders = (req, acceptHeaders = []) => {
  if (req === void 0) return

  const output = {
    // always forward IP
    'x-client-ip':
      req.headers['x-client-ip']
      || req.headers['x-forwarded-for']
      || req.headers['x-real-ip']
      || (req.info && req.info.remoteAddress)
      || req.connection.remoteAddress,
    // always forward cookies
    cookie: req.headers['cookie'],
    'x-csrf-token': req.cookies.csrf,
  }

  for (let name in req.headers) {
    name = name.toLowerCase()
    if (acceptHeaders.indexOf(name) > -1)
      output[name] = req.headers[name]
  }

  return output
}


export default ({req, assign, ignore}) => setContext(
  async (_, context) => {
    const
      currentHeaders = {...context.headers, ...(req && forwardHeaders(req, ignore))},
      headers = typeof assign === 'function'
        ? await assign(currentHeaders)
        : assign && typeof assign === 'object'
          ? {...currentHeaders, assign}
          : currentHeaders

    return {...context, headers}
  }
)