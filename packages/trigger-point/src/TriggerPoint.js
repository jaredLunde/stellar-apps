import React from 'react'
import PropTypes from 'prop-types'
import {callIfExists} from '@render-props/utils'
import {ViewportConsumer} from '@render-props/viewport'
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
      triggered: false,
      direction: 0,
      triggerPointRef: this.setRef,
      element: null
    }
  }

  static getDerivedStateFromProps ({inView, direction}, state) {
    const triggered = state.element !== null && inView(state.element)

    if (triggered === state.triggered) {
      return null
    }

    return {
      ...state,
      triggered,
      direction
    }
  }

  setRef = e => this.setState({element: e})

  componentDidUpdate (
    {onEnter, onEnterTop, onEnterBottom, onExit, onExitTop, onExitBottom},
    {triggered}
  ) {
    if (triggered !== this.state.triggered) {
      if (this.state.triggered === true) {
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

export default function TriggerPoint ({partial = false, leeway, ...props}) {
  return <ViewportConsumer observe='scrollY' children={
    ({inFullViewY, inViewY, direction}) => <TriggerPoint_
      direction={direction.y}
      inView={e => partial === true ? inViewY(e, leeway) : inFullViewY(e, leeway)}
      {...props}
    />
  }/>
}

export function withTriggerPoint (Component, opt = emptyObj) {
  return props => <TriggerPoint {...opt} children={
    triggerPoint => <Component {...triggerPoint} {...props}/>
  }/>
}