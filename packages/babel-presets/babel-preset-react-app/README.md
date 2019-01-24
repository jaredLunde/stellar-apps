# @stellar-apps/babel-preset-react-app
A babel preset for configuring React web applications in Stellar apps.

## Installation
`yarn add --dev @stellar-apps/babel-preset-react-app`

## Usage
### `.babelrc`
```json
{
  "presets": [
    [
      "@stellar-apps/react-app", {
        "es": {
          "env": {
            "modules": false
          }
        },
        "react": {
          "transformConstant": true
        },
        "emotion":  false
      }
    ]
  ]
}
```

## Included presets
- `@stellar-apps/babel-preset-es`
- `@stellar-apps/babel-preset-react`

## Included plugins
- `babel-plugin-emotion`
- `babel-plugin-polished`

## Options
### `es`
- Configures [`@stellar-apps/babel-preset-es`](https://github.com/jaredLunde/stellar-apps/tree/master/packages/babel-presets/babel-preset-es)
- *default* 
```js
{
  env: {
    "useBuiltIns": "usage",
    "loose": true,
    "modules": false
  },
  "runtime": {
    corejs: 2
  }
}
```

### `react`
- Configures [`@stellar-apps/babel-preset-react`](https://github.com/jaredLunde/stellar-apps/tree/master/packages/babel-presets/babel-preset-react)

### `emotion`
- Configures `babel-plugin-emotion`
- Define `false` to turn off this plugin
- *default* 
```js
// development
{"sourceMap": true}
// production
{"sourceMap": false, "hoist": true}
```

### `polished`
- Configures `babel-plugin-polished`
- Define `false` to turn off this plugin