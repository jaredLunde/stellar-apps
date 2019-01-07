import React from 'react'


export default function getMetaImage (url) {
  return [
    <meta property="og:image" content={url} key='0'/>,
    <meta name="twitter:image" content={url} key='1'/>
  ]
}
