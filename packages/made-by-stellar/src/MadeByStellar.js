// @jsx jsx
import {css, jsx} from '@emotion/core'
import React from 'react'
import {A} from 'curls'
import {LazyImage} from '@stellar-apps/lazy-load'


const imageCSS = css`
  contain: strict;
  vertical-align: middle;
  image-rendering: -webkit-optimize-contrast;
`

export default React.memo(
  React.forwardRef(
    function MadeByStellar ({iconSize = 16, ...props}, ref) {
      return (
        <A
          xs
          bold
          ref={ref}
          d='inline'
          href='https://BeStellar.co/'
          target='_blank'
          rel='noopener noreferrer'
          {...props}
        >
          Made with{" "}
          <span role="img" aria-label="Rocket">
            <link
              rel="preconnect dns-prefetch"
              href='https://cdn.jsdelivr.net'
              crossOrigin='true'
            />

            <LazyImage
              width={iconSize}
              height={iconSize}
              src="https://cdn.jsdelivr.net/emojione/assets/4.0/png/32/1f680.png"
              alt="🚀"
              css={imageCSS}
            />
          </span>
          {" "}by Stellar
        </A>
      )
    }
  )
)