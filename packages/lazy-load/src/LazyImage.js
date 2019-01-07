import React from 'react'
import {Box} from 'curls'
import juxt from 'juxt'
import LazyLoad from './LazyLoad'


export default React.memo(
  React.forwardRef(
    function LazyImg ({src, srcSet, placeholder, offset, ...props}, ref) {
      return (
        <LazyLoad offset={offset}>
          {({lazyLoadRef, isVisible}) =>
            placeholder && isVisible === false
              ? placeholder({lazyLoadRef})
              : <Box
                  ref={ref ? juxt(lazyLoadRef, ref) : lazyLoadRef}
                  nodeType='img'
                  src={isVisible ? src : ''}
                  data-src={src}
                  srcSet={isVisible ? srcSet : ''}
                  data-srcset={srcSet}
                  {...props}
                />
          }
        </LazyLoad>
      )
    }
  )
)