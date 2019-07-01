import {accounts} from '../../controllers'
import {errors} from '../utils'


export const signUp = (root, props, context) => errors.catchUnique(
  accounts.signUp(props, context),
  {email: 'A user with this email address already exists'}
)

export const logIn = errors.catchAll(
  (root, props, context) => accounts.logIn(props, context)
)

export const logOut = async (requires, props, context) => {
  await accounts.logOut(context)
  return null
}
