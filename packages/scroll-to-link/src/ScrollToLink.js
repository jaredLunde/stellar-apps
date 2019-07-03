import React from 'react'
import PropTypes from 'prop-types'
import {Type} from 'curls'
import BezierEasing from 'bezier-easing'
import {callIfExists} from '@render-props/utils'
import {ViewportScroll} from '@render-props/viewport'


export class ScrollToLink_ extends React.PureComponent {
  static defaultProps = {
    as: props => <Type as='a' role='button' {...props}/>,
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
    const {to, as, scrollTo, duration, timing, offset, onClick, innerRef, ...props} = this.props
    return React.createElement(
      as,
      {
        role: 'button',
        href: `/${to}`,
        onClick: this.handleClick,
        ref: innerRef,
        ...props
      }
    )
  }
}


export default React.forwardRef(
  function ScrollToLink (props, ref) {
    return <ViewportScroll children={
      ({scrollTo}) => <ScrollToLink_ innerRef={ref} scrollTo={scrollTo} {...props}/>
    }/>
  }
)