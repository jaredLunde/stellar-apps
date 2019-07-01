import {ApolloError} from 'apollo-server'
import {UniqueViolationError} from 'db-errors'


export const catchUnique = async (query, messages) => {
  let result

  try {
    result = await query
  }
  catch (err) {
    if (err instanceof UniqueViolationError) {
      throw new ApolloError(
        `json:${JSON.stringify(
          err.columns.map(
            column => ({message: messages[column] || 'An unknown error occurred'})
          )
        )}`
      )
    }
    else {
      throw err
    }
  }

  return result
}


export const catchAll = (fn, defaultMessage = 'An unknown error occurred') => {
  return async (...args) => {
    let result

    try {
      result = await fn(...args)
    }
    catch (err) {
      if (__DEV__) console.log(err)
      if (err instanceof ApolloError) {
        throw err
      }
      else if (Array.isArray(err)) {
        throw new ApolloError(`json:${JSON.stringify(err)}`)
      }
      else if (err.message) {
        const {message, code, ...other} = err
        throw new ApolloError(message, code, other)
      }
      else {
        throw new ApolloError(defaultMessage)
      }
    }

    return result
  }
}
