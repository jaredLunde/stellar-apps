import React from 'react'


export default function getDescription (description) {
  return [
    <meta name='description' content={description} key='0'/>,
    <meta property="og:description" content={description} key='1'/>
  ]
}
