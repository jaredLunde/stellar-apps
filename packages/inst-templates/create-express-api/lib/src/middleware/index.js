// NOTE: Order matters very much here! This is the order the middleware
//       are applied

// applies default HTTPS headers to each request
export defaultHeaders from './defaultHeaders'
// enables CORS requests
export cors from './cors'
// applies configuration middleware at `req.config`
export config from './config'
// applies CSRF middleware
export {verifyCSRFToken, setCSRFToken} from './csrf'
