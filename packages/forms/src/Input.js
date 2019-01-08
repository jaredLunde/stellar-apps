import React from 'react'
import {Input} from 'curls'
import {callIfExists} from '@render-props/utils'
import {Field} from 'formik'


export function FormikInput ({field, form, name, ref, renderError, ...props}) {
  const error = form.errors[name]
  const touched = form.touched[name]

  return (
    <>
      <Input
        type='text'
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
    children={field => FormikInput({...field, ref, name, ...props})}
  />
)