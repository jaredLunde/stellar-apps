import React from 'react'
import {Mutation} from 'react-apollo'
import {callIfExists} from '@render-props/utils'


function defaultUpdater (mutateOptions) {
  return mutateOptions
}

export default function MutationClick (
  {
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
    // children ;)
    children
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
      (mutate, mutationResult) => children(
        {
          onClick: function (e) {
            preventDefault && e.preventDefault()
            callIfExists(onClick, e)
            mutate(prepareUpdate({variables}))
          }
        },
        mutationResult
      )
    }
  />
}