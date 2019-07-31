import React from 'react'
import {Provider as BrokerProvider} from 'react-broker'
import {Helmet, HelmetProvider} from 'react-helmet-async'
import {css, ThemeProvider, browserResets, prettyText, containmentAttrs} from 'curls'
import {Route, Switch} from 'react-router-dom'
import theme from '~/theme'
import {Header, Footer} from '~/ui'
import * as pages from '~/pages'


const globalStyles = [browserResets, prettyText, containmentAttrs]
const Document = ({location}) => (
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

    <Header/>
    <Switch location={location}>
      {Object.values(pages)}
    </Switch>
    <Footer/>

    <div id='portals'/>
  </>
)

export default ({helmetContext = {}, chunkCache}) => (
  <HelmetProvider context={helmetContext}>
    <ThemeProvider theme={theme} globalStyles={globalStyles}>
      <BrokerProvider chunkCache={chunkCache}>
        <Route children={({location}) => {
          if (typeof window !== 'undefined') window.scrollTo(0, 0)
          return <Document location={location}/>
        }}/>
      </BrokerProvider>
    </ThemeProvider>
  </HelmetProvider>
)