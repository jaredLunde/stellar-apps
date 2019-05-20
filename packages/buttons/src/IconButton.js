import React from 'react'
import Button from './Button'
import {Icon} from '@jaredlunde/curls-addons'


const IconButton =  React.memo(
  React.forwardRef(
    ({name, size, color, ...props}, ref) => <Button
      bg='transparent'
      bw='0'
      sh='0'
      ref={ref}
      {...props}
      children={<Icon name={name} color={color} size={size}/>}
    />
  )
)

if (__DEV__) IconButton.displayName = 'IconButton'
export default IconButton