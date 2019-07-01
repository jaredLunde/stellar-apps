import Cookies from 'js-cookie'
import cookieParser from 'set-cookie-parser'


export default async ({
  res,
  fetch,
  uri,
  cookie = '',
  publicTokenName = 'csrf',
  privateTokenName = '_csrf'
}) => {
  let publicToken, privateToken

  if (typeof window !== 'undefined') {
    publicToken = Cookies.get(publicTokenName)
    privateToken = true
  }
  else if (cookie) {
    for (let pairs of cookie.split(';')) {
      cookieParser.parse(pairs).forEach(
        ({name, value}) => {
          name = name.trim()

          switch (name) {
            case publicTokenName:
              publicToken = value
              break
            case privateTokenName:
              privateToken = value
          }
        }
      )
    }
  }

  if (!publicToken || !privateToken) {
    const response = await fetch(uri, {credentials: 'include'})
    // the private token is removed because we're getting a new one below
    // and keeping the old one breaks it
    const replacePrivateToken = new RegExp(`(${privateTokenName}=.+;?)`, 'g')
    const headers = {cookie: cookie.replace(replacePrivateToken, '')}

    response.headers.forEach(
      (headerValue, headerName) =>
        headerName.toLowerCase() === 'set-cookie' && cookieParser.parse(
        cookieParser.splitCookiesString(headerValue)
        ).forEach(
        ({name, value, maxAge, ...options}) => {
          name = name.trim()

          if (name === publicTokenName) {
            headers['x-csrf-token'] = value
            options.httpOnly = false
          }
          else if (name === privateTokenName) {
            headers.cookie += `;${name}=${value}`
          }

          if (res) {
            if (maxAge) {
              // has to be in ms when using express
              options.maxAge = maxAge * 1000
            }

            res.cookies.set(name, value, options)
          }
        }
        )
    )

    headers.cookie = headers.cookie.replace(/^;/, '')
    return headers
  }

  return {'x-csrf-token': publicToken}
}
