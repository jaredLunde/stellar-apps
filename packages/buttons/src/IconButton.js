import React from 'react'
import Button from './Button'
import {Icon} from '@jaredlunde/curls-addons'


export default React.memo(
  React.forwardRef(
    function IconButton ({name, size, color, ...props}, ref) {
      return <Button
        bg='transparent'
        bw='0'
        sh='0'
        ref={ref}
        {...props}
        children={
          <Icon name={name} color={color} size={size}/>
        }
      />
    }
  )
)