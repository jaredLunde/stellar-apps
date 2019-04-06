if (typeof window !== 'undefined') {
  require('intersection-observer')
}
import React from 'react'
import PropTypes from 'prop-types'
import strictShallowEqual from '@render-props/utils/cjs/strictShallowEqual'


export default class Intersection extends React.Component {
  static propTypes = {
    root: PropTypes.any,
    pollInterval: PropTypes.number,
    useMutationObserver: PropTypes.bool.isRequired,
    rootMargin: PropTypes.string,
    thresholds: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.number), PropTypes.number]),
    initialIsIntersecting: PropTypes.bool.isRequired
  }

  static defaultProps = {
    root: null,
    pollInterval: null,
    useMutationObserver: true,
    rootMargin: '0px 0px 0px 0px',
    thresholds: 0,
    initialIsIntersecting: false
  }

  element = null

  constructor (props) {
    super (props)
    this.state = {
      intersectionRef: this.setRef,
      boundingClientRect: null,
      intersectionRatio: 0,
      intersectionRect: null,
      isIntersecting: props.initialIsIntersecting,
      rootBounds: null,
      target: null,
      time: null
    }
  }

  setRef = element => {
    if (this.element !== element) {
      if (this.observer) {
        if (this.element) {
          this.observer.unobserve(this.element)
        }

        this.element = element

        if (this.element) {
          this.observer.observe(this.element)
        }
      }
      else {
        this.element = element

        if (this.element) {
          this.createObserver()
        }
      }
    }
  }

  createObserver () {
    this.observer = new IntersectionObserver(
      this.setObserverState,
      {
        root: this.props.root,
        rootMargin: this.props.rootMargin,
        threshold: this.props.thresholds
      }
    )

    this.observer.POLL_INTERVAL = this.props.pollInterval
    this.observer.USE_MUTATION_OBSERVER = this.props.useMutationObserver
    this.observer.observe(this.element)
  }

  setObserverState = entries => {
    const entry = entries[entries.length - 1]
    this.setState({
      boundingClientRect: entry.boundingClientRect,
      intersectionRatio: entry.intersectionRatio,
      intersectionRect: entry.intersectionRect,
      isIntersecting: entry.isIntersecting,
      rootBounds: entry.rootBounds,
      target: entry.target,
      time: entry.time,
    })
  }

  componentDidUpdate ({root, rootMargin, thresholds, pollInterval, useMutationObserver}) {
    if (
      root !== this.props.root
      || rootMargin !== this.props.rootMargin
      || strictShallowEqual(thresholds, this.props.thresholds) === false
    ) {
      this.observer.disconnect()
      this.createObserver()
    }

    if (
      pollInterval !== this.props.pollInterval
      || useMutationObserver !== this.props.useMutationObserver
    ) {
      if (this.element) {
        this.observer.unobserve(this.element)
      }

      this.observer.POLL_INTERVAL = this.props.pollInterval
      this.observer.USE_MUTATION_OBSERVER = this.props.useMutationObserver
      this.observer.observe(this.element)
    }
  }

  componentWillUnmount () {
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  render () {
    return this.props.children(this.state)
  }
}