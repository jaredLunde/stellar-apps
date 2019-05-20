import React from 'react'
import {jsx} from 'curls'
import {withRouter} from 'react-router-dom'
import memoize from 'trie-memoize'
import TypeButton from './TypeButton'


// necessary for keeping TypeButton purity
const getOnClick = memoize([Map, WeakMap], (to, push) => () => push(to))
const LinkButton = React.forwardRef(
  (props, ref) => {
    const Button_ = withRouter(
      ({to, history, staticContext, match, location, replace, ...props}) => {
        props.onClick = getOnClick(to, history[replace ? 'replace' : 'push'])
        props.ref = ref
        return React.createElement(TypeButton, props)
      }
    )

    return jsx(Button_, props)
  }
)

if (__DEV__) LinkButton.displayName = 'LinkButton'
export default LinkButton