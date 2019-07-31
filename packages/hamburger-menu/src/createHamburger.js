import React from 'react'
import {css, useStyles, Button, createComponent, colorize} from 'curls'


const defaultLine = n => css`
    width: 18px;
    height: 2px;
    min-height: 2px;
    border-radius: 2px;
    margin-top: 1px;
    margin-bottom: 1px;
    position: relative;
    contain: strict;
  `

const
  options = {
    name: 'hamburger',
    styles: {
      lineNo: (n, theme) => (theme.hamburger.getLine || defaultLine)(n, theme),
      color: (val, theme) => val && colorize('background-color', val, theme)
    }
  },
  useLine = props => useStyles(options, props),
  Line = createComponent('span', useLine)

export default function createHamburger ({numLines = 3, closeButton, color, ref, ...props}) {
  const lines = []

  for (let i = 0; i < numLines; i++)
    lines.push(<Line lineNo={i} key={i} color={color || 'currentColor'}/>)

  const Hamburger = ({show, hide, toggle, isVisible}) =>
    closeButton !== void 0 && isVisible === true
      ? closeButton({show, hide, toggle, isVisible, lines, ref})
      : <Button
          column
          align='stretch'
          bg='transparent'
          bw='0'
          br='0'
          sh='0'
          h='72'
          p='x3'
          aria-haspopup='menu'
          aria-expanded={isVisible}
          aria-label='Main Menu'
          ref={ref}
          {...props}
          onClick={toggle}
          children={lines}
        />

  if (__DEV__) {
    const PropTypes = require('prop-types')
    Hamburger.propTypes = {
      color: PropTypes.string,
      lineNo: PropTypes.number
    }
  }

  return Hamburger
}