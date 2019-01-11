# @stellar-apps/lazy-load

`yarn add @stellar-apps/lazy-load`

## Usage
```js
import LazyLoad, {LazyImage, LazyIframe} from '@stellar-apps/lazy-load'

function LazyVideo ({src, offset = 100, ...props}) {
  return (
    <LazyLoad rootMargin='200px'>
      {({lazyLoadRef, isVisible}) => (
        <video 
          key={String(isVisible)} 
          ref={lazyLoadRef} 
          src={isVisible ? src : ''}
          {...props}
        />               
      )}
    </LazyLoad>
  )
}
```

### `LazyLoad`
Requires a top-level [`@render-props/ViewportProvider`](https://github.com/jaredLunde/render-props/tree/master/packages/viewport#viewportprovider) 
component

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


### Render Props
- `lazyLoadRef {React.creatRef}`
    - Must be provided as a `ref` to the underlying element you are lazy loading
- `isVisible {boolean}`
    - Returns `true` if the the element has been loaded and `false` if not.
- `visibilityRatio {number}`
    - Returns the ratio of the `intersectionRect` to the `boundingClientRect`. That is to say,
      it's the amount of the element that is current visible within the root.
    
-----

### `LazyImage`
Inherits props from HTML `<img>`, `curls/Box` and `LazyLoad`

### Props
- `placeholder(<Object {lazyLoadRef}>) {func}`
    - Should return a component to display when the element is not yet visible
- `rootMargin {string}`
    - **default** `160px`
    
-----

### `LazyIframe`
Inherits props from HTML `<iframe>`, `curls/Box`, and `LazyLoad`

### Props
- `rootMargin {string}`
    - **default** `100px`
- `placeholder(<Object {lazyLoadRef}>) {func}`
    - Should return a component to display when the element is not yet visible