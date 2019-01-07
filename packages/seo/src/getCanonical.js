import React from 'react'


export default function getCanonical (url, opt = {}) {
  const {resolve} = opt
  url = resolve ? resolve(url) : url

  return [
    <link rel='canonical' href={url} key='0'/>,
    <meta property='og:url' content={url} key='1'/>,
    <meta name='twitter:url' content={url} key='2'/>,
  ]
}
