# @stellar-apps/babel-preset-es
A babel preset for configuring ECMAScript-next features Stellar apps and packages.

## Installation
`yarn add --dev @stellar-apps/babel-preset-es`

## Usage
### `.babelrc`
```json
{
  "presets": [
    [
      "@stellar-apps/es", {
        "env": {
          "modules": false
        }
      }
    ]
  ]
}
```
## Included presets
- `@babel/preset-env`

## Included plugins
- `@babel/plugin-transform-runtime`
- `@babel/plugin-proposal-class-properties`
- `@babel/plugin-proposal-export-default-from`
- `@babel/plugin-proposal-export-namespace-from`
- `@babel/plugin-proposal-logical-assignment-operators`
- `@babel/plugin-proposal-nullish-coalescing-operator`
- `@babel/plugin-transform-object-assign`
- `@babel/plugin-proposal-object-rest-spread`
- `@babel/plugin-proposal-optional-chaining`
- `@babel/plugin-syntax-dynamic-import`
- `@babel/plugin-syntax-import-meta`
- `babel-plugin-closure-elimination`
- `babel-plugin-macros`
- `babel-plugin-dev-expression`

## Options
### `env`
- *default* `{loose: true}`
- Define `false` to turn off `@babel/preset-env`

### `runtime`
- *default* `{}`
- Define `false` to turn off `@babel/plugin-transform-runtime`

### `classProps`
- *default* `{loose: true}`

### `macros`
- Define `false` to turn off `babel-plugin-macros`