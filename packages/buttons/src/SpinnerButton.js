import React from 'react'
import {useTheme} from 'curls'
import {Spinner} from '@jaredlunde/curls-addons'
import TypeButton, {defaultTheme as buttonDefaults} from './TypeButton'


const
  defaultTheme = {
    ...buttonDefaults,
    spinner: {
      size: 16,
      color: 'white'
    }
  },
  options = {name: 'button', defaultTheme}

const SpinnerButton = React.forwardRef(
  (
    {
      spinnerColor,
      spinnerSize,
      loading,
      outline,
      typeColor,
      ...props
    },
    ref
  ) => {
    const
      theme = useTheme(options),
      spinnerProps = {...theme.spinner}

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
  }
)

if (__DEV__) SpinnerButton.displayName = 'SpinnerButton'
export default SpinnerButton