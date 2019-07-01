import csrf from 'csurf'


export const config = {
  saltLength: 16,
  secretLength: 32,
  name: 'csrf',
  cookie: {
    key: '_csrf',
    secure: !process.env.STAGE || process.env.STAGE !== 'development',
    httpOnly: true,
    domain: process.env.COOKIE_DOMAIN
  },
  value: req => req.headers['x-csrf-token']
}

export const verifyCSRFToken = (req, res, next) => {
  if (__DEV__ === true && parseInt(req.headers['x-bypass-csrf']) === 1)
    next()
  else
    csrf(config)(req, res, next)
}

export const setCSRFToken = (req, res, next) => {
  if (__DEV__ === true && parseInt(req.headers['x-bypass-csrf']) === 1)
    next()
  else if (req.cookies[config.name] === void 0)
    res.cookie('csrf', req.csrfToken(), {...config.cookie, httpOnly: false})

  next()
}
