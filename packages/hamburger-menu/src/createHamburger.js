import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'emotion'
import {Button, createComponent, colorize} from 'curls'


const defaultTheme = {
  defaultProps: {
    color: 'primary',
  },
  getLine: n => css`
    width: 18px;
    height: 2px;
    min-height: 2px;
    border-radius: 2px;
    margin-top: 1px;
    margin-bottom: 1px;
    position: relative;
    contain: strict;
  `
}
const themePath = 'hamburger'
const SFC = createComponent({
  name: 'Hamburger',
  propTypes: {
    color: PropTypes.string,
    lineNo: PropTypes.number
  },
  CSS: {
    lineNo: (n, theme) => theme.getLine(n, theme),
    color: (val, theme) => val && colorize('background-color', val, theme)
  },
  defaultTheme,
  themePath: 'hamburger'
})

export default function createHamburger (
  {
    numLines = 3,
    closeButton,
    color,
    ref,
    ...props
  }
) {
  const lines = []

  for (let i = 0; i < numLines; i++) {
    const sfcProps = {lineNo: i, key: i, children: p => <span {...p}/>}

    if (color) {
      sfcProps.color = color
    }

    lines.push(<SFC {...sfcProps}/>)
  }

  return function Hamburger ({show, hide, toggle, isVisible}) {
    return closeButton !== void 0 && isVisible === true
      ? closeButton({show, hide, toggle, isVisible, lines, ref})
      : <Button
          column
          align='stretch'
          bg='transparent'
          bw={0}
          br={0}
          sh={0}
          h='72'
          p='x3'
          aria-label='Main Menu'
          ref={ref}
          {...props}
          onClick={toggle}
          children={lines}
        />
  }
}