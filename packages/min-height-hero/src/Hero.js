import React from 'react'
import PropTypes from 'prop-types'
import {Box} from 'curls'
import {ViewportConsumer} from '@render-props/viewport'


export default class Hero extends React.Component {
  static propTypes = {
    headerID: PropTypes.string,
    footerID: PropTypes.string,
    maxHeight: PropTypes.number
  }

  static defaultProps = {
    headerID: 'main-header',
    footerID: null,
    maxHeight: Infinity
  }

  headerEl = null
  footerEl = null
  didMount = false

  componentDidMount () {
    this.forceUpdate()
    this.didMount = true
  }

  getHeight = vh => {
    if (!vh) {
      return '100vh'
    }

    let subtract = this.headerEl ? this.headerEl.getBoundingClientRect().height : 0
    subtract += this.footerEl ? this.footerEl.getBoundingClientRect().height : 0
    return Math.min(vh - subtract, this.props.maxHeight)
  }

  render () {
    let {headerID, footerID, maxHeight, ...props} = this.props

    if (typeof document !== 'undefined') {
      this.headerEl = document.getElementById(headerID)
      this.footerEl = document.getElementById(footerID)
    }

    return (
      <ViewportConsumer observe='height'>
        {({height}) => (
          <Box
            key={`hero-${this.didMount}`}
            flex
            wrap
            w='100%'
            minH={this.getHeight(height)}
            {...props}
          />
        )}
      </ViewportConsumer>
    )
  }
}
