# @stellar-apps/intersection
A render prop component pattern which provides an interface for the `IntersectionObserver` API.

The IntersectionObserver interface of the Intersection Observer API provides a way to asynchronously observe changes in 
the intersection of a target element with an ancestor element or with a top-level document's viewport. The ancestor 
element or viewport is referred to as the root.

When an IntersectionObserver is created, it's configured to watch for given ratios of visibility within the root. The 
configuration cannot be changed once the IntersectionObserver is created, so a given observer object is only useful for 
watching for specific changes in degree of visibility.


## Installation
`yarn add @stellar-apps/intersection`

## Usage
```js
import Intersection from '@stellar-apps/intersection'

function IntersectionBox (props) {
  return (
    <Intersection pollInterval={100} thresholds={[0, 0.25]}>
      {({intersectionRef, isIntersecting}) => (
        <Box {...props} ref={intersectionRef}>
          Is intersecting? {String(isIntersecting)}
          Intersection ratio: {String(intersectionRatio)}
        </Box>
      )}
    </Intersection>
  )
}
```

### `Intersection`

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

### Render props
- `intersectionRef {React.createRef}`
    - Must be provided to the element you'd like to start observing
    - `<div ref={intersectionRef}/>`
- `boundingClientRect {DOMRectReadOnly}`
    - **default** `null`
    - Returns the bounds rectangle of the target element as a  [`DOMRectReadOnly`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRectReadOnly). 
      The bounds are computed as described in the documentation for [`Element.getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
- `intersectionRect {DOMRectReadOnly}`
    - **default** `null`
    - Returns a [`DOMRectReadOnly`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRectReadOnly) representing the 
      target's visible area
- `intersectionRatio {number}`
    - **default** `0`
    - Returns the ratio of the `intersectionRect` to the `boundingClientRect`
- `isIntersecting {bool}`
    - **default** `false`
    - A Boolean value which is `true` if the target element intersects with the intersection observer's root. If this is 
      `true`, then, the IntersectionObserverEntry describes a transition into a state of intersection; if it's `false`,
      then you know the transition is from intersecting to not-intersecting.
- `rootBounds {DOMRectReadOnly}`
    - **default** `null`
    - Returns a [`DOMRectReadOnly`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRectReadOnly) for the intersection observer's root
- `target {DOMElement}`
    - **default** `null`
    - The Element whose intersection with the root changed
- `time {DOMHighResTimeStamp}`
    - **default** `null`
    - A [`DOMHighResTimeStamp`](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp) indicating the 
      time at which the intersection was recorded, relative to the `IntersectionObserver`'s time origin.