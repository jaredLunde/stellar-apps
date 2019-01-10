# @stellar-apps/content
A component for establishing site-wide content widths

## Installation
`yarn add @stellar-apps/content`

## Usage
```js
import Content from '@stellar-apps/content'


function HomePage(props) {
  return (
    <Box>
      <Content>
        Some content constrained to the content width
      </Content>
      
      <Content slim>
        Some content constrained to the slim content width
      </Content>
    </Box>
  )
}
```

### `Content`
### Props
In addition to the props below, this component accepts any prop that `curls/Box` accepts.
- `slim {bool}`
    - **default** `width * 0.61803398875 // golden ratio`
    - Uses the `slimWidth` defined in the theme

### defaultCSS
```js
const defaultCSS = css`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
`
```

### defaultTheme
```js
const defaultTheme = {
  width: 1360,
  slimWidth: null // width * 0.61803398875
}
```