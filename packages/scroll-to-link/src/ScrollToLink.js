import React from 'react'
import PropTypes from 'prop-types'
import {A} from 'curls'
import BezierEasing from 'bezier-easing'
import {callIfExists} from '@render-props/utils'
import {ViewportConsumer} from '@render-props/viewport'


export class ScrollToLink_ extends React.Component {
  static defaultProps = {
    as: A,
    duration: 400,
    timing: BezierEasing(0.4, 0, 0.2, 1)
  }

  static propTypes = {
    as: PropTypes.any,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.func]),
    duration: PropTypes.number,
    timing: PropTypes.func,
    offset: PropTypes.number
  }

  componentDidMount () {
    this.element =
      typeof document !== 'undefined' && document.querySelectorAll(this.props.to)[0]
  }

  handleClick = e => {
    e.preventDefault()

    if (this.element) {
      this.props.scrollTo(
        0,
        this.element.offsetTop + parseFloat(this.props.offset || 0),
        {
          duration: this.props.duration,
          timing: this.props.timing
        }
      )

      callIfExists(this.props.onClick, e)
    }
  }

  render () {
    const {to, as, scrollTo, duration, timing, offset, onClick, ...props} = this.props
    return React.createElement(
      as,
      {
        role: 'button',
        href: `/${to}`,
        onClick: this.handleClick,
        ...props
      }
    )
  }
}


export default function ScrollToLink (props) {
  return <ViewportConsumer observe='scrollY' children={
    ({scrollTo}) => <ScrollToLink_ scrollTo={scrollTo} {...props}/>
  }/>
}