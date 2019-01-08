# @stellar-apps/trigger-point
A component for triggering events when an element enters or exits the viewport.
This component requires a top-level [ViewportProvider](https://github.com/jaredLunde/render-props/tree/master/packages/viewport#viewportprovider).

## Installation
`yarn add @stellar-apps/trigger-point`

## Usage
```js
import TriggerPoint from '@stellar-apps/trigger-point'


<TriggerPoint partial>
  {({triggerPointRef, inView, status, direction, element}) => (
    <span ref={triggerPointRef}>
      {inView ? 'in view' : 'not in view'}
      {" "}
      {status ? status : 'not yet triggered'}
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
    
### Render props
- `triggerPointRef {React.createRef}`
    - A ref to provided to the element attached to the trigger point
- `inView {bool}`
    - **default** `false`
    - Returns `true` if the element is currently in the viewport, `false` if not
- `status {string}`
    - **default** `untriggered`
    - One of `untriggered`, `enterTop`, `exitTop`, `enterBottom`, `exitBottom`. This represents
      the most recent status of the trigger event.
- `direction {number}`
    - **default** `0`
    - The direction scrolling is happening. `-1` for up, `1` for down, `0` for neutral
- `element {DOMElement}`
    - **default** `null`
    - The ref'd element