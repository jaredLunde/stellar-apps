import React from 'react'
import SpinnerButton from './SpinnerButton'


const SubmitButton = React.forwardRef(
  (props, ref) => React.createElement(
    SpinnerButton,
    Object.assign(
      {ref, type: 'submit', children: 'Submit',},
      props
    )
  )
)

if (__DEV__) SubmitButton.displayName = 'SubmitButton'
export default SubmitButton