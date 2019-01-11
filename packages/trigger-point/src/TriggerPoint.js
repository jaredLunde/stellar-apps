import React from 'react'
import PropTypes from 'prop-types'
import {callIfExists} from '@render-props/utils'
import {ViewportConsumer} from '@render-props/viewport'
import Intersection from '@stellar-apps/intersection'
import emptyObj from 'empty/object'


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
      isTriggered: false,
      direction: 0,
      triggerPointRef: props.intersectionRef,
      status: 'untriggered'
    }
    this.previsTriggered = false
  }

  static getDerivedStateFromProps (
    {isTriggered, direction, intersectionRef, intersectionRatio},
    state
  ) {
    const nextIsTriggered = isTriggered

    if (nextIsTriggered === state.isTriggered) {
      return null
    }

    let status = 'untriggered'

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
        <ViewportConsumer observe='scrollY' children={
          ({direction}) => <TriggerPoint_
            direction={direction.y}
            isTriggered={isIntersecting}
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
        }/>}
    </Intersection>
  )
}

export function withTriggerPoint (Component, opt = emptyObj) {
  return props => <TriggerPoint {...opt} children={
    triggerPoint => <Component {...triggerPoint} {...props}/>
  }/>
}