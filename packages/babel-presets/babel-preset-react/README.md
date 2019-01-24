# @stellar-apps/babel-preset-react
A babel preset for configuring React transforms in Stellar apps and packages.

## Installation
`yarn add --dev @stellar-apps/babel-preset-react`

## Usage
### `.babelrc`
```json
{
  "presets": [
    [
      "@stellar-apps/react", {
        "transformConstant": true,
        "transformPure": false
      }
    ]
  ]
}
```
## Included presets
- `@babel/preset-react`

## Included plugins
- `@babel/plugin-transform-react-constant-element`
- `babel-plugin-transform-react-pure-components`
- `babel-plugin-transform-react-remove-prop-types`

## Options
### `transformPure`
- Define `false` to turn off `babel-plugin-transform-react-pure-components`

### `transformConstant`
- Define `false` to turn off `@babel/plugin-transform-react-constant-element`

### `removePropTypes`
- Define `false` to turn off `babel-plugin-transform-react-remove-prop-types`