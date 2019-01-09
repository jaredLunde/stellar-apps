# @stellar-apps/apollo
This package contains `react-apollo` utilities and components

## Installation
`yarn add @stellar-apps/apollo`

## Usage
```js
import {MutationForm, MutationButton} from '@stellar-apps/apollo'
```

### `MutationForm`
A render props component for easily implementing a `react-apollo`-based Mutation form using Formik. No
`fetch` polyfill is provided because the assumption is you're already implementing such a thing with
your Apollo implementation.

### Props
In addition to the props below, it inherits props from [Formik](https://jaredpalmer.com/formik/docs/api/formik#props-1)
and [react-apollo Mutation](https://www.apollographql.com/docs/react/essentials/mutations.html#props)
- `confirm {func}`
    - If defined, the mutation will only run if this function returns `true`
    - Receives two arguments `(formikValues, formikBag)` [seen here](https://jaredpalmer.com/formik/docs/api/formik#onsubmit-values-values-formikbag-formikbag-void)
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


### `MutationButton`
A wrapper for `SpinnerButton` above and `react-apollo/Mutation`

### Props
In addition to the props below, this component also receives props for `SpinnerButton` above and
[react-apollo Mutation](https://www.apollographql.com/docs/react/essentials/mutations.html#props)
- `confirm {func}`
    - If defined, the mutation will only run if this function returns `true`
    - Receives two arguments `(formikValues, formikBag)` [seen here](https://jaredpalmer.com/formik/docs/api/formik#onsubmit-values-values-formikbag-formikbag-void)
- `prepareUpdate {func}`
    - **default** `({variables}) => ({variables})`
    - Should return an object to send to the `react-apollo` `mutate()` function. See 
      [here](https://www.apollographql.com/docs/react/api/react-apollo.html#mutation-render-prop)
      for details on additional options.
    - By default this returns the `{values}` from `Formik` as `{variables}`