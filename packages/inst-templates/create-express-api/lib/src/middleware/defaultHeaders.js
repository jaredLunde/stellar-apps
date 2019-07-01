export const headers = {
  // all responses will be JSON
  'Content-Type': 'application/json',
  // performance enhancement for SSL via caching
  'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
  // a feature of Internet Explorer, Chrome and Safari that stops pages
  // from loading when they detect reflected cross-site scripting (XSS)
  // attacks
  'X-XSS-Protection': '1; mode=block',
  // fixes caching issues when using gzip compression
  'Vary': 'Accept-Encoding'
}

export default (req, res, next) => {
  res.set(headers)
  next()
}
