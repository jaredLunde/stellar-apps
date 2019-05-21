import React from 'react'
import PropTypes from 'prop-types'
import {css, useStyles, createElement, useBox, memoThemeValue} from 'curls'

const
  defaultStyles = css`
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  `,
  defaultTheme = {
    width: 1360,
    slimWidth: null
  },
  options = {
    name: 'content',
    styles: {
      __base: memoThemeValue((val, theme) => css`max-width: ${theme.width}px;`),
      slim: memoThemeValue((val, theme) => val === true && (
        css`max-width: ${theme.slimWidth || theme.width * 0.61803398875}px;`
      ))
    },
    defaultStyles,
    defaultTheme
  }

const
  useContent = props => useStyles(Object.assign({__base: true}, props), options),
  Content = React.forwardRef(
  (props, ref) => {
    props = useBox(useContent(props))
    props.ref = ref
    return createElement('div', props)
  }
)

if (__DEV__) {
  Content.displayName = 'Content'
  Content.propTypes = {slim: PropTypes.bool}
}

export {useContent}
export default Content