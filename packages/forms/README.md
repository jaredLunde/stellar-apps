# @stellar-apps/forms
This package contains form-related components with helpers for `fetch`-based and `react-apollo`-based
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
JSON response handling. It includes a `fetch` polyfill using `unfetch`.

### Props
In addition to the props below, it inherits props from [Formik](https://jaredpalmer.com/formik/docs/api/formik#props-1)
- `endpoint {string}`
    - This is the URL endpoint you'd like to send the form request to
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

### `MutationForm`
A render props component for easily implementing a `react-apollo`-based Mutation form using Formik. No
`fetch` polyfill is provided because the assumption is you're already implementing such a thing with
your Apollo implementation.

### Props
In addition to the props below, it inherits props from [Formik](https://jaredpalmer.com/formik/docs/api/formik#props-1)
and [react-apollo Mutation](https://www.apollographql.com/docs/react/essentials/mutations.html#props)
- `prepareUpdate {func}`
    - **default** `({variables}) => ({variables})`
    - Should return an object to send to the `react-apollo` `mutate()` function. See 
      [here](https://www.apollographql.com/docs/react/api/react-apollo.html#mutation-render-prop)
      for details on additional options.
    - By default this returns the `{values}` from `Formik` as `{variables}`
    
### Render function
- `children(<formik>, <mutationResult>)`
    - `formik`
        - See [Formik render props](https://jaredpalmer.com/formik/docs/api/formik#children-reactreactnode-props-formikprops-values-reactnode)
    - `mutationResult`
        - See [Mutation result](https://www.apollographql.com/docs/react/api/react-apollo.html#mutation-render-prop) here

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