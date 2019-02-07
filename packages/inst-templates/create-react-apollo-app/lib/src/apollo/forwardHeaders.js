import emptyArr from 'empty/array'
import cookieParser from 'set-cookie-parser'


export function getCookies (req) {
  const out = []

  for (let name in req.cookies) {
    out.push(`${name}=${req.cookies[name]}`)
  }

  return out.join(';')
}

export const responseHeaders = [
  'set-cookie',
  'server-timing'
]

export function forwardRequestHeaders (req, ignore = emptyArr) {
  if (req === void 0) return;

  const output = {
    // always forward IP
    'x-client-ip':
      req.headers['x-client-ip']
      || req.headers['x-forwarded-for']
      || req.headers['x-real-ip']
      || (req.info && req.info.remoteAddress)
      || req.connection.remoteAddress,
    // always forward cookies
    cookie: getCookies(req),
    'x-csrf-token': req.cookies.csrf,
  }

  for (let name in req.headers) {
    name = name.toLowerCase()
    
    if (ignore.indexOf(name) === -1) {
      output[name] = req.headers[name]
    }
  }

  return output
}


export function forwardResponseHeaders (
  inputHeaders,
  res,
  acceptHeaders = responseHeaders
) {
  return inputHeaders && inputHeaders.forEach(
    (value, name) => {
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

              res.cookie(name, value, options)
            }
          )
        }
        else {
          res.set(name, value)
        }
      }
    }
  )
}
