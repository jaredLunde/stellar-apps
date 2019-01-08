import React from 'react'
import {Formik} from 'formik'
import {callIfExists} from '@render-props/utils'
import {Mutation} from 'react-apollo'


function defaultUpdater (mutateOptions, formikBag) {
  return mutateOptions
}

export default function MutationForm (
  {
    // mutation
    mutation,
    update,
    prepareUpdate = defaultUpdater,
    initialVariables,
    refetchQueries,
    awaitRefetchQueries,
    context,
    // form state
    confirm,
    initialValues,
    enableReinitialize,
    // status changes
    onError,
    onCompleted,
    onSubmit,
    onReset,
    // validation
    validate,
    validateOnBlur,
    validateOnChange,
    validationSchema,
    // child
    children
  }
) {
  return <Mutation
    mutation={mutation}
    update={update}
    variables={initialVariables}
    refetchQueries={refetchQueries}
    awaitRefetchQueries={awaitRefetchQueries}
    context={context}
    onError={onError}
    children={
      (mutate, mutationResult) => (
        <Formik
          onReset={onReset}
          onSubmit={function (variables, formikBag) {
            callIfExists(onSubmit, variables, formikBag)
            mutate(prepareUpdate({variables}, formikBag)).then(
              result => {
                formikBag.setSubmitting(false)
                if (result !== void 0 && result.data) {
                  callIfExists(onCompleted, result.data, formikBag)
                }
              }
            )
          }}
          initialValues={initialValues}
          enableReinitialize={enableReinitialize}
          validate={validate}
          validateOnBlur={validateOnBlur}
          validateOnChange={validateOnBlur}
          validationSchema={validationSchema}
          children={formikBag => children(formikBag, mutationResult)}
        />
      )
    }
  />
}