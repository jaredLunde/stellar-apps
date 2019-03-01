import React from 'react'
import {Hero as CurlsHero} from 'curls'


export default class Hero extends React.Component {
  static defaultProps = {headerID: 'main-header', footerID: null}

  headerEl = null
  footerEl = null
  didMount = false

  componentDidMount () {
    this.forceUpdate()
    this.didMount = true
  }

  render () {
    let {children, headerID, footerID, trimFrom, innerRef, ...props} = this.props

    if (typeof document !== 'undefined') {
      this.headerEl = document.getElementById(this.props.headerID)
      this.footerEl = document.getElementById(this.props.footerID)
    }

    let trimHeight = [this.headerEl]

    if (this.footerEl) {
      trimHeight.push(this.footerEl)
    }

    return React.createElement(
      CurlsHero, {
        key: `hero-${this.didMount}`,
        trimHeight,
        ref: innerRef,
        ...props,
        children
      }
    )
  }
}