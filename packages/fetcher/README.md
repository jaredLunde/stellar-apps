# @stellar-apps/fetcher
A useful set of components for fetching JSON data on both the client and server side.

## Installation
`yarn add @stellar-apps/fetcher`

## Usage
```js
import * as Fetcher from '@stellar-apps/fetcher'


export default function App () {
  return (
    <Fetcher.FetcherProvider>
      <Fetcher.Fetch>
        {({status, response}) => status !== 'done' ? status : (
          JSON.stringify(response.data)
        )}
      </Fetcher.Fetch>
    </Fetcher.FetcherProvider>
  )
}
```