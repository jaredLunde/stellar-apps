# @stellar-apps/forms
This package contains form-related components with helpers for `fetch`-based
forms using `Formik` and `curls` in the background.

## Installation
`yarn add @stellar-apps/forms`

## Usage
```js
import {FetchForm, Input, TextArea} from '@stellar-apps/forms'


function ContactForm (props) {
  return (
    <FetchForm endpoint='/contact'>
      {({isSubmitting, handleSubmit, json}) => {
        if (json.status === 200) {
          return <Redirect to='/success'/>
        }
        
        return (
           <form onSubmit={handleSubmit}>
             <Input type='email' name='email' validate={...}/>
             <TextArea name='message'  validate={...}/>
             
             <button type='submit' disabled={isSubmitting}>
               Submit
             </button>
           </form>
        )
      }}
    </FetchForm>
  )
}
```

### `FetchForm`
A render props component for easily implementing a `fetch`-based form in Formik with
JSON response handling. Requires a `fetch` polyfill in browsers

### Props
In addition to the props below, it inherits props from [Formik](https://jaredpalmer.com/formik/docs/api/formik#props-1)
- `endpoint {string}`
    - This is the URL endpoint you'd like to send the form request to
- `confirm {func}`
    - If defined, the fetch will only run if this function returns `true`
    - Receives two arguments `(formikValues, formikBag)` [seen here](https://jaredpalmer.com/formik/docs/api/formik#onsubmit-values-values-formikbag-formikbag-void)
- `getRequestBody {func}`
    - **default** `(values, formikBag) => JSON.stringify(values)`
    - Returns the body for the request
    - Receives two arguments `(formikValues, formikBag)` [seen here](https://jaredpalmer.com/formik/docs/api/formik#onsubmit-values-values-formikbag-formikbag-void)
- `getRequestHeaders {func}`
    - **default** `() => ({}) //noop`
    - Returns headers you'd like to attach to the request (e.g. CSRF)
    - Receives two arguments `(formikValues, formikBag)` [seen here](https://jaredpalmer.com/formik/docs/api/formik#onsubmit-values-values-formikbag-formikbag-void)
- `onSubmit {func}`
    - Called when the form is submitted and preempts the `fetch()` request for easy bailouts.
    - Receives two arguments `(formikValues, formikBag)` [seen here](https://jaredpalmer.com/formik/docs/api/formik#onsubmit-values-values-formikbag-formikbag-void)

### Render props
In addition to the render props below, it inherits render props from 
[Formik](https://jaredpalmer.com/formik/docs/api/formik#children-reactreactnode-props-formikprops-values-reactnode)
- `response {fetch.Response}`
    - The response object returned by the `fetch()` request
- `json {fetch.json()}`
    - The response JSON returned by `await request.json()`
    
------

### `Input`
A wrapper for `curls/Input` and `formik/Field`

### Props
In addition to the props below, this component accepts props from 
[`formik/Field`](https://jaredpalmer.com/formik/docs/api/field#props-1) and `curls/Input`

- `renderError {func}`
    - Accepts two arguments `error` and `form` from `Formik`
    - Rendered after the curls `<Input/>` as part of a `React.Fragment`
    - Is only rendered if there is an error and the field has been touched
    
------

### `TextArea`
A wrapper for `curls/TextArea` and `formik/Field`

### Props 
In addition to the props below, this component accepts props from 
[`formik/Field`](https://jaredpalmer.com/formik/docs/api/field#props-1) and `curls/TextArea`

- `renderError {func}`
    - Accepts two arguments `error` and `form` from `Formik`
    - Rendered after the curls `<TextArea/>` as part of a `React.Fragment`
    - Is only rendered if there is an error and the field has been touched