# `@jaredlunde/babel`


`yarn add --dev @jaredlunde/babel`

```js
// .babelrc
// DEFAULT: ["@jaredlunde/babel", {"env": {"loose": "true"}}]
{
  "env": {
    "cjs": {
      "presets": [
        ["@jaredlunde/babel", {"env": {"useBuiltIns": "usage"}}]
      ]
    },
    "es": {
      "presets": [
        ["@jaredlunde/babel", {"env": {"modules": false, "useBuiltIns": "usage"}}]
      ]
    }
  }
}
```
