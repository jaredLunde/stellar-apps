// NOTE: Order matters very much here! This is the order the middleware
//       are applied
export const log = (req, res, next) => {
  if (__DEBUG__) {
    const
      oldWrite = res.write,
      oldEnd = res.end,
      chunks = []

    res.write = function (chunk) {
      chunks.push(new Buffer(chunk))
      oldWrite.apply(res, arguments)
    }

    res.end = function (chunk) {
      if (chunk)
        chunks.push(new Buffer(chunk))

      let body = Buffer.concat(chunks).toString('utf8')
      console.log('[path]', req.path)
      console.log('[body]', body)
      console.log('[headers]', req.headers)
      console.log('[status]', req.status)
      oldEnd.apply(res, arguments)
    }
  }

  next()
}
// applies default HTTPS headers to each request
export defaultHeaders from './defaultHeaders'
// applies configuration middleware at `req.config`
export config from './config'
// enables CORS requests
export cors from './cors'
// applies CSRF middleware
export {verifyCSRFToken, setCSRFToken} from './csrf'
// opens the db
export knex from './knex'
// user sessions
export session from './session'
export * from './passport'