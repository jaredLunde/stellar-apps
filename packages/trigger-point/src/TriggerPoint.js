import React from 'react'
import PropTypes from 'prop-types'
import {callIfExists} from '@render-props/utils'
import Intersection from '@stellar-apps/intersection'
import emptyObj from 'empty/object'


function getScrollTop (element) {
  return !element
    ? (window.scrollY || window.pageYOffset)
    : (element.scrollTop || element.scrollY || element.pageYOffset)
}

class TriggerPoint_ extends React.Component {
  static propTypes = {
    onEnter: PropTypes.func,
    onExit: PropTypes.func,
    onEnterTop: PropTypes.func,
    onExitTop: PropTypes.func,
    onEnterBottom: PropTypes.func,
    onExitBottom: PropTypes.func,
  }

  constructor (props) {
    super(props)
    this.state = {
      direction: 0,
      scrollTop: 0,
      isTriggered: false,
      triggerPointRef: props.intersectionRef,
      status: 'untriggered'
    }
    this.previsTriggered = false
  }

  static getDerivedStateFromProps (
    {root, isTriggered, intersectionRef, intersectionRatio},
    state
  ) {
    const nextIsTriggered = isTriggered

    if (nextIsTriggered === state.isTriggered) {
      return null
    }

    let status = 'untriggered'
    const scrollTop = getScrollTop(root)
    const direction = scrollTop > state.scrollTop ? 1 : -1

    if (state.status !== 'untriggered' || nextIsTriggered === true) {
      if (direction === -1) {
        status = nextIsTriggered === false ? 'exitTop' : 'enterBottom'
      }
      else if (direction === 0) {
        status = 'exitTop'
      }
      else {
        status = nextIsTriggered === false ? 'exitBottom' : 'enterTop'
      }
    }

    return {
      triggerPointRef: intersectionRef,
      visibilityRatio: intersectionRatio,
      isTriggered: nextIsTriggered,
      status,
      direction,
      scrollTop
    }
  }

  componentDidUpdate (
    {onEnter, onEnterTop, onEnterBottom, onExit, onExitTop, onExitBottom},
    {isTriggered}
  ) {
    if (isTriggered !== this.state.isTriggered) {
      if (this.state.isTriggered === true) {
        callIfExists(onEnter, this.state)

        if (this.state.direction === 1) {
          callIfExists(onEnterTop, this.state)
        }
        else {
          callIfExists(onEnterBottom, this.state)
        }
      }
      else {
        callIfExists(onExit, this.state)

        if (this.state.direction === -1) {
          callIfExists(onExitTop, this.state)
        }
        else {
          callIfExists(onExitBottom, this.state)
        }
      }
    }
  }

  render () {
    return this.props.children(this.state)
  }
}

export default function TriggerPoint (
  {
    root,
    pollInterval,
    disableMutationObserver,
    rootMargin,
    thresholds,
    minRatio,
    onEnter,
    onExit,
    onEnterTop,
    onExitTop,
    onEnterBottom,
    onExitBottom,
    children
  }
) {
  return (
    <Intersection
      root={root}
      pollInterval={pollInterval}
      disableMutationObserver={disableMutationObserver}
      rootMargin={rootMargin}
      thresholds={thresholds}
    >
      {({isIntersecting, intersectionRef, intersectionRatio}) =>
        <TriggerPoint_
          root={root}
          isTriggered={isIntersecting && (minRatio || intersectionRatio) <= intersectionRatio}
          intersectionRef={intersectionRef}
          intersectionRatio={intersectionRatio}
          onEnter={onEnter}
          onExit={onExit}
          onEnterTop={onEnterTop}
          onExitTop={onExitTop}
          onEnterBottom={onEnterBottom}
          onExitBottom={onExitBottom}
          children={children}
        />
      }
    </Intersection>
  )
}

export function withTriggerPoint (Component, opt = emptyObj) {
  return props => <TriggerPoint {...opt} children={
    triggerPoint => <Component {...triggerPoint} {...props}/>
  }/>
}