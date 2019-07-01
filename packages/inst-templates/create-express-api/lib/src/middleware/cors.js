import cors from 'cors'


let whitelist = [
  // 'https://foo.app',
  // 'https://staging.foo.app'
]

if (process.env.STAGE === 'development')
  whitelist = ['http://127.0.0.1:3000', 'http://127.0.0.1:4000', 'http://192.168.0.8:3000', 'http://192.168.0.8:4000']

export const config = {
  origin: (origin, callback) => {
    if (origin === void 0 || whitelist.indexOf(origin) !== -1)
      callback(null, true)
    else
      callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  maxAge: 604800,
  optionsSuccessStatus: 200,  // change this to 200 if one desires support for IE11
  credentials: true,
}

export default cors(config)
