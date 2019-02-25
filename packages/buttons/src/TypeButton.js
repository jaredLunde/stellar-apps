import React from 'react'
import {ThemeConsumer, Type} from 'curls'
import Button, {defaultTheme as buttonDefaults} from './Button'


export const defaultTheme = {
  ...buttonDefaults,
  type: {
    flex: true,
    row: true,
    size: 'sm',
    align: 'center',
    weight: 'ultraHeavy',
    face: 'primary',
    color: 'primaryText'
  }
}

export default React.forwardRef(
  function TypeButton ({typeSize, typeWeight, typeFace, typeColor, ...props}, ref) {
    return (
      <ThemeConsumer path='button' defaultTheme={defaultTheme}>
        {({theme}) => {
          if (props.outline === true) {
            typeColor = typeColor || props.bg || theme.defaultProps.bg
          }

          typeColor = typeColor || theme.type.color

          const typeProps = Object.assign(
            {},
            theme.type,
            {
              face: typeFace || theme.type.face,
              color: typeColor,
              children: props.children
            }
          )

          if (typeSize) {
            typeProps.size = typeSize
          }

          if (typeWeight) {
            typeProps[typeWeight] = true
          }

          return React.createElement(
            Button,
            {
              ref,
              ...props,
              children: React.createElement(Type, typeProps)
            }
          )
        }}
      </ThemeConsumer>
    )
  }
)