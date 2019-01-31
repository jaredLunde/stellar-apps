import React from 'react'
import lazy from 'react-broker/macro'
import {Box} from 'curls'


const lazyOpt = {
  loading: function loadingComponent (props) {
    return <Box
      d='inlineBlock'
      role={props.role || ''}
      title={props.title}
      aria-label={props.title}
      br={5}
      className={props.className}
      style={{backgroundColor: props.pathStyle.fill, ...props.style, opacity: 0.2}}
    />
  }
}

// export const someIcon = lazy('./someIcon', lazyOpt)

/**
import React, {Suspense, lazy} from 'react'
import {Box} from 'curls'


function Loading (props) {
  return <Box
    d='inlineBlock'
    role={props.role || ''}
    title={props.title}
    aria-label={props.title}
    br={5}
    className={props.className}
    style={{backgroundColor: props.pathStyle.fill, ...props.style, opacity: 0.2}}
  />
}

function withSuspense (Component) {
  return React.forwardRef(
    function (props) {
      return <Suspense fallback={<Loading {...props}/>} maxDuration={0} children={Component}/>
    }
  )
}

export const AppStore = withSuspense(lazy(() => import('./AppStore')))
export const Caret = withSuspense(lazy(() => import('./Caret')))
export const Check = withSuspense(lazy(() => import('./Check')))
export const Dots = withSuspense(lazy(() => import('./Dots')))
export const Empty = withSuspense(lazy(() => import('./Empty')))
export const GooglePlay = withSuspense(lazy(() => import('./GooglePlay')))
*/
