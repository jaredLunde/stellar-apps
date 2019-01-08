import React from 'react'
import {TextArea} from 'curls'
import {callIfExists} from '@render-props/utils'
import {Field} from 'formik'


export function FormikTextArea ({field, form, name, ref, renderError, ...props}) {
  const error = form.errors[name]
  const touched = form.touched[name]

  return (
    <>
      <TextArea
        autoResize
        ref={ref}
        {...props}
        {...field}
        onBlur={
          (...args) => {
            field.onBlur(...args)
            callIfExists(props.onBlur, ...args)
          }
        }
      />

      {touched && error && renderError(error, form)}
    </>
  )
}

export default React.forwardRef(
  ({name, validate, ...props}, ref) => <Field
    name={name}
    validate={validate}
    children={field => FormikTextArea({...field, ref, name, ...props})}
  />
)