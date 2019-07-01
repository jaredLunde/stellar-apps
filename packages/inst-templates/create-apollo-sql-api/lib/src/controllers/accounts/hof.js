export const ifLoggedIn = fn => (root, args, context, info) => {
  if (context.req.isLoggedIn())
    return fn(root, args, context, info)

  context.res.status(403)
  throw ({message: `You must be logged in to perform this action`})
}

export const ifIs = propName => fn => (root, args, context, info) => {
  if (context.req.isLoggedIn() && context.req.viewer.id === args[propName])
    return fn(root, args, context, info)

  context.res.status(403)
  throw ({
    message: `You must be the ${propName} of this resource to perform this action`
  })
}

export const ifOwner = ifIs('owner')
export const ifActor = ifIs('actor')
export const ifTarget = ifIs('target')
