import React from 'react'


export default function getTwitterCard (
  content = 'summary_large_image'/*player, summary*/,
  {twitterHandle, origin}
) {
  return [
    <meta name="twitter:card" content={content} key='0'/>,
    <meta name="twitter:site" content={`@${twitterHandle}`} key='1'/>,
    <meta name="twitter:creator" content={`@${twitterHandle}`} key='2'/>,
    <meta name="twitter:domain" content={origin} key='3'/>,
  ]
}
