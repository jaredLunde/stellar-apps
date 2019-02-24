import React from 'react'
import Broker from 'react-broker'
import Helmet, {HelmetProvider} from 'react-helmet-async'
import {ThemeProvider, browserResets} from 'curls'
import {css, Global} from '@emotion/core'
import theme from '~/theme'
import {Home} from '~/pages'
import {Header, Footer} from '~/ui'


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
        {process.env.PUBLIC_PATH.startsWith('http') &&
          <link rel="dns-prefetch preconnect" href={process.env.PUBLIC_PATH} crossOrigin/>}
      </Helmet>

      <Global styles={browserResets}/>

      <Header/>
      <Home/>
      <Footer/>

      <div id='portals'/>
    </>
  )
}

export default ({helmetContext = {}, chunkCache, device}) => (
  <HelmetProvider context={helmetContext}>
    <ThemeProvider theme={{locals: {device}, ...theme}}>
      <Broker.Provider chunkCache={chunkCache}>
        <Document/>
      </Broker.Provider>
    </ThemeProvider>
  </HelmetProvider>
)