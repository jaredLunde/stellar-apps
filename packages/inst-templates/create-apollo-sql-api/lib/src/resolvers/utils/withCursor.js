import emptyObj from 'empty/object'


const toString = (value) => {
  if (value && value.toJSON)
    value = value.toJSON()

  return JSON.stringify(value)
}

export const get = (after, next, numItems) => {
  let cursor = null

  if (numItems > next && numItems > (after + next)) {
    cursor = after + next
  }

  return cursor
}

export const numPages = (numItems, next) => Math.ceil(numItems / next) || 1
export const currentPage = (after, next) => Math.ceil(after / next)

export default (opt = emptyObj) => {
  const {defaultNext = 40, numKey = 'numItems'} = opt

  return fn => async (root, args, context, info) => {
    const result = {...(await fn(root, args, context, info))}
    const size = result[numKey]
    let {next = defaultNext, after = 0, by} = args.cursor || emptyObj
    let prev = (currentPage(after, next) - 1) * next
    prev = prev < 0 ? 0 : prev
    next = get(after, next, size)
    delete result[numKey]

    return {
      ...result,
      cursor: {
        by,
        next,
        prev,
        size
      }
    }
  }
}
