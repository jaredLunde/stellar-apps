# @stellar-apps/lazy-load

`yarn add @stellar-apps/lazy-load`

## Usage
```js
import LazyLoad, {LazyImage, LazyIframe} from '@stellar-apps/lazy-load'

function LazyVideo ({src, offset = 100, ...props}) {
  return (
    <LazyLoad offset={offset}>
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

## `LazyLoad`
Requires a top-level [`@render-props/ViewportProvider`](https://github.com/jaredLunde/render-props/tree/master/packages/viewport#viewportprovider) 
component

### Props
- `offset {number}`
    - **default** `200`
    - Starts loading the element when it is within this number of pixels outside of the 
      current viewport

### Render Props
- `lazyLoadRef {React.creatRef}`
    - Must be provided as a `ref` to the underlying element you are lazy loading
- `isVisible {boolean}`
    - Returns `true` if the the element has been loaded and `false` if not.
    
-----

## `LazyImage`
Inherits props from HTML `<img>`, `curls/Box` and `LazyLoad`

### Props
- `offset {number}`
    - See `LazyLoad` above
- `placeholder(<Object {lazyLoadRef}>) {func}`
    - Should return a component to display when the element is not yet visible
    
-----

## `LazyIframe`
Inherits props from HTML `<iframe>`, `curls/Box`, and `LazyLoad`

### Props
- `offset {number}`
    - See `LazyLoad` above
- `placeholder(<Object {lazyLoadRef}>) {func}`
    - Should return a component to display when the element is not yet visible