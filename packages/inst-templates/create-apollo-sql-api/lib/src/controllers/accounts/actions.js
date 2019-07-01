import emptyObj from 'empty/object'
import safeCompare from 'safe-compare'
import cryptoRandString from 'crypto-random-string'
import randInt from 'random-int'
import config from '../../config'
import {Account, AccountSession} from '../../models'
import * as accounts from './queries'


// Manages persistent account logins (remember me)
export const tokens = {
  // sets a cookie token for a given account to persist logins
  async set ({key}, res) {
    const {name, ...cookieOptions} = config.accounts.cookie
    const token = cryptoRandString(32)
    const sess = await AccountSession.query().insert({key, token}).returning('*')
    const id = AccountSession.columns.id.encode(sess.id)
    res.cookie(name, `${id}-${key}-${token}`, cookieOptions)
  },
  // gets the [key, token] pair from the cookie
  async getCredentials (req) {
    const {name, ...cookieOptions} = config.accounts.cookie
    const cookie = req.cookies[name]

    // no cookie was found
    if (cookie === void 0)
      return []

    return cookie.split('-')
  },
  // gets the account associated with a cookie token
  async get (req, res) {
    const [id, key, token] = await tokens.getCredentials(req)
    // destroys the cookie if there wasn't a token provided
    if (key === void 0 || token === void 0) {
      await tokens.destroy(emptyObj, res)
      return
    }
    // looks for an account session with the associated personal key and
    // cookie token
    const sess = await AccountSession.query().findOne({
      id: AccountSession.columns.id.decode(id)
    })
    // destroys the cookie if no valid account sessions were found
    if (
      sess === void 0
      || sess.key !== key
      || tokens.verify(sess.token, token) === false
    ) {
      await tokens.destroy(emptyObj, res)
      return
    }
    // returns the account associated with the personal key (if there is one)
    return Account.query().findOne({key})
  },
  // compares the content of AccountSession.token to Cookie.token and returns
  // true if they are the same
  //
  // this is done with a time-constant value comparison to prevent timing attacks
  verify (sessionToken, cookieToken, res) {
    return safeCompare(
      AccountSession.columns.token.decrypt(sessionToken, config.accounts.secret),
      cookieToken
    )
  },
  // destroys the token cookie and optionally clears any tokens stored in
  // AccountSession with this users' personal key
  async destroy ({key, token}, res) {
    const {name, domain, path} = config.accounts.cookie
    res.clearCookie(name, {path, domain})

    if (key !== void 0) {
      if (token === void 0) {
        await AccountSession.query().deleteById(key)
      }
      else {
        await AccountSession.query().delete().filter({key, token})
      }
    }
  }
}

// sleeps for a random amount of time between min/max (in seconds)
// this is useful for preventing timing-style attacks on sign up / login,
// for instance one could infer whether or not a username/email actually exists
// in a database if the timing of the request is ___
export const fuzz = (min, max) => {
  min = min * 1000
  max = max * 1000
  return new Promise(resolve => setTimeout(resolve, randInt(min, max)))
}

export const signUp = async ({email, password, rememberMe}, {req, res}) => {
  await fuzz(0.04, 0.33)
  const account = await Account.query().insert({
    email,
    password,
    joinIp: req.ip,
    lastIp: req.ip,
  }).returning('*')

  await new Promise(resolve => req.logIn(account, resolve))
  // creates a remember me token / account session
  if (rememberMe === true)
    await tokens.set(account, res)

  return account
}

export const logIn = async ({email, password, rememberMe}, {req, res}) => {
  await fuzz(0.04, 0.33)
  const account = await accounts.getByEmail(email)
  const verified = account && await Account.columns.password.verify(account.password, password)

  if (!account || verified === false)
    throw ({
      message: `This email address does not exist or the provided password incorrect`
    })
  console.log('Logging in...')
  await new Promise(resolve => req.logIn(account, resolve))
  // creates a remember me token / account session
  if (rememberMe === true)
    await tokens.set(account, res)
  console.log('Logged in...', account)
  return account
}

export const logOut = async ({req, res}) => {
  // deletes any remember me tokens
  await tokens.destroy(tokens.getCredentials(req), res)
  // deletes the req.session
  return req.logOut()
}
