import emptyObj from 'empty/object'
import walkTree from '@jaredlunde/react-tree-walker'


export default function load (app, visitor, context = emptyObj) {
  let stop = false

  function loadVisitor (element, instance) {
    if (stop === true) {
      return false
    }

    if (instance && instance.isFetcher === true) {
      if (instance.props.stopIteration === true) {
        stop = true
      }

      return instance.prefetch(context)
    }
  }

  let visitors = loadVisitor

  if (visitor) {
    visitors = function composedVisitor (element, instance) {
      const promise = loadVisitor(element, instance)

      if (promise !== void 0) {
        return promise
      }

      return visitor(element, instance, context)
    }
  }

  return walkTree(app, visitors, context)
}
