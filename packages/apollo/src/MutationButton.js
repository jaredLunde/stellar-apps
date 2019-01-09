import React from 'react'
import {Mutation} from 'react-apollo'
import {callIfExists} from '@render-props/utils'
import {SpinnerButton} from '@stellar-apps/buttons'


function defaultUpdater (mutateOptions) {
  return mutateOptions
}

export default function MutationButton (
  {
    buttonType = SpinnerButton,
    // mutation
    mutation,
    update,
    prepareUpdate = defaultUpdater,
    variables,
    refetchQueries,
    awaitRefetchQueries,
    context,
    preventDefault = true,
    // events
    onError,
    onCompleted,
    onClick,
    // confirm
    confirm,
    // button props
    ...props
  }
) {
  return <Mutation
    mutation={mutation}
    update={update}
    variables={variables}
    refetchQueries={refetchQueries}
    awaitRefetchQueries={awaitRefetchQueries}
    context={context}
    onCompleted={onCompleted}
    onError={onError}
    children={
      (mutate, mutationResult) => {
        return React.createElement(
          buttonType,
          {
            ref,
            onClick: (...args) => {
              if (typeof confirm !== 'function' || confirm(...args)) {
                preventDefault && e.preventDefault()
                callIfExists(onClick, e)
                mutate(prepareUpdate({variables}))
              }
            },
            loading: buttonType === SpinnerButton ? mutationResult.loading : void 0,
            ...props
          }
        )
      }
    }
  />
}