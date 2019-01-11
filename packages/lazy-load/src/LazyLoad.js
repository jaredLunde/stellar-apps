import React from 'react'
import {ViewportConsumer} from '@render-props/viewport'
import {strictShallowEqual} from '@render-props/utils'


// TODO: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
// https://github.com/w3c/IntersectionObserver/tree/master/polyfill
class LazyLoad_ extends React.Component {
  lazy = React.createRef()
  state = {visible: false}

  static defaultProps = {
    offset: 200
  }

  componentDidMount () {
    this.isInView()
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.state.visible === false || strictShallowEqual(nextProps, this.props) === false
  }

  componentDidUpdate () {
    this.isInView()
  }

  isInView () {
    if (
      typeof window === 'undefined' ||
      this.lazy &&
      this.lazy.current &&
      this.state.visible === false &&
      this.props.inViewY(
        this.lazy.current,
        {
          top: this.props.offset * -1,
          bottom: this.props.offsets
        }
      )
    ) {
      this.setState({visible: true})
    }
  }

  render () {
    return this.props.children({lazyLoadRef: this.lazy, isVisible: this.state.visible})
  }
}

export default function LazyLoad (props) {
  return <ViewportConsumer children={vp => <LazyLoad_ {...vp} {...props}/>}/>
}