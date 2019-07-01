export const withCount = fn => async props => {
  let
    query = fn(props),
    items = await query,
    numItems

  if (!!props.next && !props.after && items.length < props.next)
    numItems = items.length
  else
    numItems = parseInt(await query.resultSize())

  return {items, numItems}
}