import React from 'react'
import Intersection from '@stellar-apps/intersection'


class LazyLoader extends React.Component {
  state = {
    isVisible: false,
    visibilityRatio: 0,
    lazyLoadRef: null
  }

  static getDerivedStateFromProps (
    {isIntersecting, intersectionRatio, intersectionRef},
    {isVisible}
  ) {
    return {
      isVisible: isVisible || isIntersecting,
      visibilityRatio: intersectionRatio,
      lazyLoadRef: intersectionRef
    }
  }

  render () {
    return this.props.children(this.state)
  }
}


let WARNED = false

export default function LazyLoad (
  {
    root,
    pollInterval,
    disableMutationObserver,
    offset,
    rootMargin,
    thresholds,
    children
  }
) {
  let isVisible = false

  if (__DEV__) {
    if (offset && WARNED === false) {
      WARNED = true
      console.warn(`The 'offset' prop is deprecated, use 'rootMargin' instead.`)
    }
  }

  return (
    <Intersection
      root={root}
      pollInterval={pollInterval}
      disableMutationObserver={disableMutationObserver}
      rootMargin={offset ? `${offset}px ${offset}px ${offset}px ${offset}px` : rootMargin}
      thresholds={thresholds}
    >
      {intersection => <LazyLoader {...intersection} children={children}/>}
    </Intersection>
  )
}