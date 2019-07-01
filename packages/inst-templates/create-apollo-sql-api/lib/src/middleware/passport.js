import passport from 'passport'
import {accounts} from '../controllers'


// configures passport user serialization
passport.serializeUser((account, done) => done(null, account.id))
passport.deserializeUser(
  (id, done) => accounts.get(id).then(
    account => done(null, account || null)
  )
)
// initializes passport with 'viewer' as the property stored in req
export const passportInitialize = passport.initialize({userProperty: 'viewer'})
// when req.logIn() is called a session will be created with the user info
// serialized in serializeUser above
export const passportSession = passport.session()
// enables secure persistent login tokens
export const viewer = async (req, res, next) => {
  req.viewer = req.viewer || null
  req.isLoggedIn = req.isAuthenticated
  // if the account was found in a session, check for a remember me token
  if (req.viewer === null) {
    try {
      req.viewer = await accounts.tokens.get(req, res) || null
    }
    catch (err) {
      console.log(err)
    }
  }
  // on to the next middleware
  next()
}
