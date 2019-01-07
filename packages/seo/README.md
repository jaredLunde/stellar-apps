# @stellar-apps/seo
Basic tools for killing several birds with one stone in non-complex meta data situations. 

## Installation
`yarn add @stellar-apps/seo`

## Usage
```js
import Helmet from 'react-helmet'
import {getTitle} from '@stellar-apps/seo'

function HomePage (props) {
  return (
    <Helmet>
      {getTitle('Stellar - Denver, CO')}
      {/**
        <title key='0'>Stellar - Denver, CO</title>
        <meta name="twitter:title" content='Stellar - Denver, CO'>
        <meta property="og:title" content='Stellar - Denver, CO'>
       **/}
    </Helmet>
  )
}
```

## `getTitle(<title>)`
- `title {string}`
    - Creates a `<title>`, `<meta name='twitter:title'/>`, and `<meta property='og:title'/>`
      component
    
## `getDescription(<description>)`
- `description {string}`
    - Creates a `<meta name='description'/>` and `<meta property='og:description'/>`
      component
      
## `getCanonical(<url>, <options>)`
- `url {string}`
    - Creates a `<link rel='canonical'/>`, `<meta name='twitter:url'/>`, and `<meta property='og:url'/>`
      component
- `options {object}`
    - `resolve {func}`
        - If provided, will resolve the `@url` using this function
       
## `getMetaImage(<url>)`
- `url {string}`
    - Creates a `<meta property="og:image"/>` and `<meta name="twitter:image"/>` component
    
## `getTwitterCard(<content>, <options>)`
- `content {string}`
    - **default** `summary_large_image`
    - One of `summary_large_image`, `player`, or `summary`
- `options {object}`
    - `twitterHandle {string}`
        - The Twitter handle to link to the page 
    - `origin {string}`
        - The Twitter domain associated with the Twitter handle's page