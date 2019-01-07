# @stellar-apps/viewport-hero
A Hero component that sets the viewport's height as a `height`.

## Installation
`yarn add @stellar-apps/viewport-hero`

## Usage
```js
import Hero from '@stellar-apps/viewport-hero'

function HomePage (props) {
  return (
    <Hero headerID='my-header' maxHeight={900}>
      
    </Hero>
  )
}
```

### Hero
#### Props
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