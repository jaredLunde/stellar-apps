import React from 'react'
import {ThemeConsumer} from 'curls'
import {Spinner} from '@jaredlunde/curls-addons'
import TypeButton, {defaultTheme as buttonDefaults} from './TypeButton'


const defaultTheme = {
  ...buttonDefaults,
  spinner: {
    size: 16,
    color: 'white'
  }
}

export default React.forwardRef(
  function SpinnerButton (
    {
      spinnerColor,
      spinnerSize,
      loading,
      outline,
      typeColor,
      ...props
    },
    ref
  ) {
    return (
      <ThemeConsumer path='button' defaultTheme={defaultTheme}>
        {({theme}) => {
          const spinnerProps = {...theme.spinner}

          spinnerProps.color = spinnerColor
            ? spinnerColor
            : typeColor
              ? typeColor
              : outline
                ? (props.bg || theme.defaultProps.bg || theme.type.color || 'primaryText')
                : spinnerProps.color

          spinnerProps.size = spinnerSize || theme.spinner.size

          const buttonProps = {
            typeColor,
            outline,
            ref,
            ...props,
            children: loading === true ? <Spinner {...spinnerProps}/> : props.children
          }

          return React.createElement(TypeButton, buttonProps)
        }}
      </ThemeConsumer>
    )
  }
)