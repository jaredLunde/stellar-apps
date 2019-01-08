import React from 'react'
import {withRouter} from 'react-router-dom'
import memoize from 'memoize-two-args'
import TypeButton from './TypeButton'


// necessary for keeping TypeButton purity
const getOnClick = memoize((to, push) => () => push(to), Map)

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