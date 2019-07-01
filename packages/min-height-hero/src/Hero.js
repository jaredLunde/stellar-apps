import React, {useRef, useState, useEffect} from 'react'
import {Box} from 'curls'
import {useWindowHeight} from '@react-hook/window-size'


export default React.forwardRef(
  ({headerID = 'main-header', footerID = null, maxHeight = Infinity, ...props}, ref) => {
    let
      headerEl = useRef(headerID && typeof document !== 'undefined' && document.getElementById(headerID)),
      footerEl = useRef(footerID && typeof document !== 'undefined' && document.getElementById(footerID)),
      [didMount, setDidMount] = useState(false),
      height = useWindowHeight(),
      minH

    useEffect(
      () => {
        setDidMount(true)

        if (headerID)
          headerEl.current = document.getElementById(headerID)
        if (footerID)
          footerEl.current = document.getElementById(footerID)
      },
      [headerID, footerID]
    )

    if (!height)
      minH = '100vh'
    else {
      let subtract = headerEl.current ? headerEl.current.getBoundingClientRect().height : 0
      subtract += footerEl.current ? footerEl.current.getBoundingClientRect().height : 0
      minH = Math.min(height - subtract, maxHeight)
    }

    return <Box
      key={`hero-${didMount}`}
      flex
      wrap
      w='100%'
      minH={minH}
      ref={ref}
      {...props}
    />
  }

)