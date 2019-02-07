import React from 'react'
import {Route} from 'react-router-dom'
import lazy from 'react-broker/macro'
import {DelayedSpinner} from '@jaredlunde/curls-addons'
import Hero from '@stellar-apps/min-height-hero'
// These are the page URL definitions. URLs are defined this way so that they can
// easily be updated later on. Any references in <Link to={}/> should use these
// references
import * as urls from './urls'


const Loading = <Hero align='center' bg='black' children={<DelayedSpinner size={32} color='white'/>}/>
const lazyProps = {loading: () => Loading}
// this is here so there's no issues with forgetting to add a `key` property
const route = props => <Route key={props.path} {...props}/>

// NOTE: Order here matters
// ------------------------
//
// The order these routes are defined in is the same order that they show up in
// inside the <Switch> statement in the <Document> of '../index'
//
// It is imperative you keep this in mind, which is why this comment is so logn and different
// from other comments here
export const Home = route({
  path: urls.home(),
  exact: true,
  component: lazy('./Home', lazyProps)
})
