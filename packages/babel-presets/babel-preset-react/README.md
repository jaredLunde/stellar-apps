# `@jaredlunde/react-preset`


`yarn add --dev @jaredlunde/react-preset`

```js
// .babelrc
// DEFAULT: ["@jaredlunde/react-preset", {"env": {"loose": "true"}}]
{
  "env": {
    "cjs": {
      "presets": [
        ["@jaredlunde/react-preset", {"transformPure": false, "removePropTypes": false}]
      ]
    },
    "es": {
      "presets": [
        ["@jaredlunde/react-preset", {"transformPure": false}}]
      ]
    }
  }
}
```
