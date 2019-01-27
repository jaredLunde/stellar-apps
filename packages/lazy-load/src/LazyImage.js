import React from 'react'
import {Box} from 'curls'
import juxt from 'juxt'
import LazyLoad from './LazyLoad'


export default React.memo(
  React.forwardRef(
    function LazyImg (
      {
        src,
        srcSet,
        placeholder,
        // from LazyLoad
        root,
        pollInterval,
        disableMutationObserver,
        offset,
        rootMargin = '160px',
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
          {({lazyLoadRef, isVisible}) =>
            placeholder && isVisible === false
              ? placeholder({lazyLoadRef, ...props})
              : <Box
                  ref={ref ? juxt(lazyLoadRef, ref) : lazyLoadRef}
                  as='img'
                  src={isVisible ? src : ''}
                  data-src={src}
                  srcSet={isVisible ? srcSet : ''}
                  data-srcset={srcSet}
                  width={props.width ? props.width : isVisible ? void 0 : 1}
                  height={props.height ? props.height : isVisible ? void 0 : 1}
                  {...props}
                />
          }
        </LazyLoad>
      )
    }
  )
)