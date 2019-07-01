import session from 'express-session'
import RedisStore_ from 'connect-redis'


// User sessions
const
  RedisStore = RedisStore_(session),
  getSession = config => session({
    name: '_sid',
    store: new RedisStore({
      host: config.redis.host,
      port: config.redis.port,
      pass: config.redis.password
    }),
    saveUninitialized: false,
    resave: true,
    secret: config.session.secret,
    cookie: {
      key: '_sid',
      httpOnly: true,
      secure: process.env.STAGE !== 'development',
      domain: process.env.COOKIE_DOMAIN
    }
  })

export default (req, res, next) => getSession(req.config)(req, res, next)
