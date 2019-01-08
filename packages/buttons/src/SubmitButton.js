import React from 'react'
import SpinnerButton from './SpinnerButton'


export default React.forwardRef(
  function SubmitButton (props, ref) {
    return React.createElement(
      SpinnerButton,
      {
        ref,
        type: 'submit',
        ...props,
        children: props.children || 'Submit'
      }
    )
  }
)