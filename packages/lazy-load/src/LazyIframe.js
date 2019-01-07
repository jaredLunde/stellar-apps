import React from 'react'
import {Box} from 'curls'
import juxt from 'juxt'
import LazyLoad from './LazyLoad'


export default React.memo(
  React.forwardRef(
    function LazyIframe ({src, placeholder, offset = 100, ...props}, ref) {
      return (
        <LazyLoad offset={offset}>
          {({lazyLoadRef, isVisible}) => (
            placeholder && isVisible === false
              ? placeholder({lazyLoadRef})
              : <Box
                  key={String(isVisible)}
                  ref={ref ? juxt(lazyLoadRef, ref) : lazyLoadRef}
                  nodeType='iframe'
                  d='block'
                  src={isVisible ? src : ''}
                  data-src={src}
                  {...props}
                />
          )}
        </LazyLoad>
      )
    }
  )
)