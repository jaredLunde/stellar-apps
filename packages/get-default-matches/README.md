# @stellar-apps/get-default-matches
Determines the default breakpoint to set for a `curls/BreakPoint` component based upon the
device returned by the curls `theme.grid.device` (one of desktop/mobile/tablet).

In `inst-app` apps, the device type is determined by Amazon CloudFront headers when
using Lambda and APIGateway.

```js
// From @inst-app/ssr
function getDevice (headers) {
  if (headers['cloudfront-is-smarttv-viewer'] === 'true') {
    return 'desktop'
  }
  else if (headers['cloudfront-is-tablet-viewer'] === 'true') {
    return 'tablet'
  }
  else if (headers['cloudfront-is-mobile-viewer'] === 'true') {
    return 'mobile'
  }
  else if (headers['cloudfront-is-desktop-viewer'] === 'true') {
    return 'desktop'
  }
}
```

## Installation
`yarn add @stellar-apps/get-default-matches`

## Usage
```js
import {ThemeProvider, BreakPoint, Box} from 'curls'
import getDefaultMatches from '@stellar-apps/get-default-matches'
import theme from '~/theme'


function App ({device}) {
  const curlsTheme = {grid: {}, ...theme}
    
  if (device) {
    curlsTheme.grid.device = device
  }
    
  return (
    <ThemeProvider theme={curlsTheme}>
      <BreakPoint sm defaultMatches={getDefaultMatches('sm')}>
        {({matches}) => <Box p={matches.sm ? 2 : 3}/>}
      </BreakPoint>
    </ThemeProvider>
  )
}
```

### `getDefaultMatches(...<breakPoints>)`
- `breakPoints {string}`
    - One or several `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`
    - Should generally be the same as the flags provided to the `BreakPoint` component