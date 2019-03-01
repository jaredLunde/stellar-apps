import React from 'react'
import {withRouter} from 'react-router-dom'
import memoize from 'trie-memoize'
import TypeButton from './TypeButton'


// necessary for keeping TypeButton purity
const getOnClick = memoize([Map, WeakMap], (to, push) => () => push(to))

export default React.forwardRef(
  function LinkButton (props, ref) {
    const Button_ = withRouter(
      function ButtonWithRouter ({to, history, staticContext, match, location, ...props}) {
        props.onClick = getOnClick(to, history.push)
        props.ref = ref
        return React.createElement(TypeButton, props)
      }
    )

    return <Button_ {...props}/>
  }
)