# @stellar-apps/scroll-to-link
A link component for scrolling to a particular querySelector on the page using an easing
function.

## Installation
`yarn add @stellar-apps/scroll-to-link`

## Usage
```js
import ScrollToLink from '@stellar-apps/scroll-to-link'


<ScrollToLink to='#some-id' duration={500}/>
```

### `ScrollToLink`
### Props
- `as {React.Component}`
    - **default** `curls/A`
    - The type of Component to render the scroll link as
- `to {string}`
    - The query selector to scroll to when the link is clicked. e.g. `#your-cool-id`
- `duration {number]`
    - **default** 400
    - The amount of time to spend scrolling to the element defined in `to`
- `timing {func}`
    - **default** `BezierEasing(0.4, 0, 0.2, 1)`
    - The timing function used to ease the scrolling
- `offset {number}`
    - A positive or negative offset used to add a padding to the position of the
      element you're scrolling to. If positive, it will scroll past the element by the
      defined amount.