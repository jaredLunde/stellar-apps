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
      inView: false,
      direction: 0,
      triggerPointRef: this.setRef,
      status: 'untriggered',
      element: null
    }
    this.previnView = false
  }

  static getDerivedStateFromProps ({inView, direction}, state) {
    const nextInView = state.element !== null && inView(state.element)

    if (nextInView === state.inView) {
      return null
    }

    let status = 'untriggered'

    if (state.status !== 'untriggered' || nextInView === true) {
      if (direction === -1) {
        status = nextInView === false ? 'exitTop' : 'enterBottom'
      }
      else if (direction === 0) {
        status = 'exitTop'
      }
      else {
        status = nextInView === false ? 'exitBottom' : 'enterTop'
      }
    }

    return {...state, inView: nextInView, status, direction}
  }

  setRef = e => this.setState({element: e})

  componentDidUpdate (
    {onEnter, onEnterTop, onEnterBottom, onExit, onExitTop, onExitBottom},
    {inView}
  ) {
    if (inView !== this.state.inView) {
      if (this.state.inView === true) {
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