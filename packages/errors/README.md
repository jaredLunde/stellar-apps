# @stellar-apps/errors
This package contains an Error provider and formatter  around `@jaredlunde/curls-addons/Alerts` for 
displaying errors in a Drawer-like fashion from the top of the viewport.

## Installation
`yarn add @stellar-apps/errors`

## Usage
```js
import {Errors, ErrorsProvider, ErrorsConsumer} from '@stellar-apps/errors'

function App (props) {
  return (
    <ErrorsProvider> {/** Stores the errors */}
      <ErrorsConsumer>
        {({setErrors}) => (
          <>
            <Errors/> {/** Displays the errors */}
            <SomeForm onError={setErrors}/> {/** Sets the errors */}
          </>
        )}
      </ErrorsConsumer>
    </ErrorsProvider>
  )
}
```

### `ErrorsProvider`
Provides context for error handling

### Props
- `formatter {func}`
    - Formats any incoming errors from `setErrors()` in the `ErrorsConsumer`

------

### `ErrorsConsumer`
Provides a function for setting errors (`setErrors`) and an array of current errors in the
error context

### Render props
- `setErrors {func}`
    - Accepts one argument for setting new errors.
        - When the argument is a function, this works exactly like `setState`
        - When the argument is not a function, any existing errors will be replaced by
          the errors provided here
    - Errors should stick to a format similar to `{code: 400, message: 'Foo'}` to work with the
      `Errors` component out of the box.
       
- `errors {array}`
    - **default** `[]`
    - An array of all current errors in the context
    
------

### `Errors`
A component for displaying errors in the context in a Drawer-like fashion from the top of the
viewport

### Props
In addition to the props below, you can provide props for `@jaredlunde/curls-addons/Alerts`
- `errorBox {func}`
    - Renders each individual error
    - Has one argument for the following object:
        - `{n, id, code, message}`
            - `n {number}`
                - The index of this error in the `errors` array
            - `id {number|string}`
                - The ID of the error
            - `code {number}`
                - Error code if provided in `setErrors`
            - `message {string}`
                - The error message