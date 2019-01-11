# @stellar-apps/trigger-point
A component for triggering events when an element enters or exits the viewport.
This component requires a top-level [ViewportProvider](https://github.com/jaredLunde/render-props/tree/master/packages/viewport#viewportprovider).

## Installation
`yarn add @stellar-apps/trigger-point`

## Usage
```js
import TriggerPoint from '@stellar-apps/trigger-point'


<TriggerPoint partial>
  {({triggerPointRef, isTriggered, status, direction, element}) => (
    <span ref={triggerPointRef}>
      {isTriggered ? 'in view' : 'not in view'}
      {" "}
      {status ? status : 'not yet triggered'}
    </span>
  )}
</TriggerPoint>
```

### `TriggerPoint`
### Props
- `root {DOM Element}`
    - **default** `document`
    - A specific ancestor of the target element being observed. If no value was passed to the constructor or this is 
      `null`, the top-level document's viewport is used
- `rootMargin {string}`
    - **default** `0 0 0 0`
    - Margin around the root. Can have values similar to the CSS margin property, e.g.
      "10px 20px 30px 40px" (top, right, bottom, left). The values can be percentages. 
      This set of values serves to grow or shrink each side of the root element's bounding 
      box before computing intersections.
- `thresholds {number|Array}`
    - **default** `0`
    - Either a single number or an array of numbers which indicate at what percentage of the 
      target's visibility the observer's callback should be executed. If you only want to 
      detect when visibility passes the 50% mark, you can use a value of `0.5`. If you want the 
      callback to run every time visibility passes another 25%, you would specify the array 
      `[0, 0.25, 0.5, 0.75, 1]`. The default is 0 (meaning as soon as even one pixel is visible, 
      the callback will be run). A value of 1.0 means that the threshold isn't considered passed until 
      every pixel is visible.
- `pollInterval {number}`
    - **default** `null`
    - The frequency in which the polyfill polls for intersection changes
    - Only relevant if you'd like to detect changes for any of the following:
        - CSS changes on :hover, :active, or :focus states
        - CSS changes due to transitions or animations with a long initial delay
        - Resizable <textarea> elements that cause other elements to move around
        - Scrolling of non-document elements in browsers that don't support the event capture phase
- `disableMutationObserver {bool}`
    - **default** `false`
    - You can choose to not check for intersections when the DOM changes by setting this property to `true`
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
- `isTriggered {bool}`
    - **default** `false`
    - Returns `true` if the element is currently in the viewport, `false` if not
- `visibilityRatio {number}`
    - **default** `0`
    - Returns the ratio of the `intersectionRect` to the `boundingClientRect`. That is to say,
      it's the amount of the element that is current visible within the root.
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