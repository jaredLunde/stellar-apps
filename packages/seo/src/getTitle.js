import React from 'react'


export default function getTitle (title) {
  return [
    <title key='0'>{title}</title>,
    <meta name="twitter:title" content={title} key='1'/>,
    <meta property="og:title" content={title} key='2'/>,
  ]
}
