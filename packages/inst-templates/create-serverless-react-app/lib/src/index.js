import React from 'react'
import Broker from 'react-broker'
import Helmet, {HelmetProvider} from 'react-helmet-async'
import {ThemeProvider, browserResets} from 'curls'
import {css, Global} from '@emotion/core'
import theme from '~/theme'
import {Home} from '~/pages'
import {Header, Footer} from '~/ui'

// injects global CSS into the document
const globalStyles = css`
  ${browserResets};

  body {
    quotes: "“" "”";
  }

  svg:not(:root) {
    display: inline-block;
  }

  [data-strict=true] {
    contain: strict;
  }

  [data-autosize=true] {
    contain: content;
  }

  [data-autopaint=true] {
    contain: layout style;
  }
  
  [hidden] {
    display: none !important;
  }
`

function Document () {
  return (
    <>
      <Helmet>
        <html lang="en"/>
        <meta charset="utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black"
        />
        <meta
          name="viewport"
          content="width=device-width, user-scalable=yes, initial-scale=1.0"
        />
        <meta name="theme-color" content='#000'/>
        <link rel="dns-prefetch preconnect" href='' crossOrigin='true'/>
      </Helmet>

      <Global styles={globalStyles}/>

      <Header/>
      <Home/>
      <Footer/>

      <div id='portals'/>
    </>
  )
}

export default function App ({
  chunkCache,
  userAgent,
  clientStats,
  device,
  env,
  stage,
  helmetContext = {}
}) {
  return (
    <HelmetProvider context={helmetContext}>
      <Broker.Provider chunkCache={chunkCache}>
        <ThemeProvider theme={theme}>
          <Document/>
        </ThemeProvider>
      </Broker.Provider>
    </HelmetProvider>
  )
}
