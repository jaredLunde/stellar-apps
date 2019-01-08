# @stellar-apps/trigger-point
A component for triggering events when an element enters or exits the viewport.
This component requires a top-level [ViewportProvider](https://github.com/jaredLunde/render-props/tree/master/packages/viewport#viewportprovider).

## Installation
`yarn add @stellar-apps/trigger-point`

## Usage
```js
import TriggerPoint from '@stellar-apps/trigger-point'


<TriggerPoint partial>
  {({triggerPointRef, triggered, direction, element}) => (
    <span ref={triggerPointRef}>
      {triggered ? 'in view' : 'not in view'}
    </span>
  )}
</TriggerPoint>
```

### `TriggerPoint`
### Props
- `partial {bool}`
    - **default** `false`
    - When `true` this component will trigger *on* when the element is partially visible. If
      `false` it will only trigger if the component is fully visible.
- `leeway {number|object {top, right, bottom, left}}`
    - The element is considered visible if it is within the viewport give or take this value in
      the specified directions.
- `onEnter {func}`
    - Callback event for when the element enters into the viewport
- `onExit {func}`
    - Callback event for when the element exits the viewport
- `onEnterTop {func}`
    - Callback event for when the element enters into the viewport from the top
- `onExitTop {func}`
    - Callback event for when the element exits the viewport from the top
- `onEnterBottom {func}`
    - Callback event for when the element enters into the viewport from the bottom
- `onExitBottom {func}`
    - Callback event for when the element exits the viewport from the bottom