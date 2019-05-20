import React from 'react'
import {jsx, Button as CurlsButton, useTheme} from 'curls'
import * as buttonDefaults from 'curls/dist/es/Button/defaultTheme'


export const
  defaultTheme = {
    ...buttonDefaults,
    outline: {
      bw: 1,
    },
  },
  options = {name: 'button', defaultTheme}

const Button = React.forwardRef(
  ({outline = false, ...props}, ref) => {
    const theme = useTheme(options)
    props = Object.assign({ref}, theme.defaultProps, props)

    if (outline === true) {
      props.bc = props.bg || theme.bg
      props.bg = 'transparent'
      delete props.sh
      Object.assign(props, theme.outline)
    }

    return jsx(CurlsButton, props)
  },
)

if (__DEV__) Button.displayName = 'Button'
export default Button