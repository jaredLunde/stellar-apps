# @stellar-apps/min-height-hero
A Hero component that sets the viewport's height as a `min-height` unless the `maxHeight` prop
is set and exceeds the viewport height.

## Installation
`yarn add @stellar-apps/min-height-hero`

## Usage
```js
import Hero from '@stellar-apps/min-height-hero'

function HomePage (props) {
  return (
    <Hero headerID='my-header' maxHeight={900}>
      
    </Hero>
  )
}
```

### Hero
#### Props
- `maxHeight {number}`
    - **default** `Infinity`
    - The maximum allowed height of the Hero
- `headerID {string}`
    - **default** `main-header`
    - A header DOM id to subtract from the height of the hero. i.e. if provided and 
      the header element's height is 96, the height of the hero will be 
      `viewportHeight - 96`
- `footerID {string}`
    - **default** `null`
    - A footer DOM id to subtract from the height of the hero. i.e. if provided and 
      the footer element's height is 96, the height of the hero will be 
      `viewportHeight - 96`