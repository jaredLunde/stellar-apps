import React from 'react'
import {Box} from 'curls'
import juxt from 'juxt'
import LazyLoad from './LazyLoad'


export default React.memo(
  React.forwardRef(
    function LazyIframe (
      {
        src,
        placeholder,
        // from LazyLoad
        root,
        pollInterval,
        disableMutationObserver,
        offset,
        rootMargin = '100px',
        thresholds,
        // for Box
        ...props
      },
      ref
    ) {
      return (
        <LazyLoad
          root={root}
          pollInterval={pollInterval}
          disableMutationObserver={disableMutationObserver}
          offset={offset}
          rootMargin={rootMargin}
          thresholds={thresholds}
        >
          {({lazyLoadRef, isVisible}) => (
            placeholder && isVisible === false
              ? placeholder({lazyLoadRef, ...props})
              : <Box
                  key={String(isVisible)}
                  ref={ref ? juxt(lazyLoadRef, ref) : lazyLoadRef}
                  as='iframe'
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