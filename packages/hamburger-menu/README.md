# @stellar-apps/hamburger-menu
A component for creating configurable and versatile hamburger menus and hamburgers.

## Installation
`yarn add @stellar-apps/hamburger-menu`

## Usage
```js
import HamburgerMenu, {createHamburger} from '@stellar-apps/hamburger-menu'


const Hamburger = createHamburger({numLines: 3})

function Header (props) {
  return (
    <HamburgerMenu hamburger={Hamburger} fromLeft>
      {({show, hide, toggle, isVisible}) => (
        <Box bg='primary' w='100%' h='100%' ov='auto touch'>
          This is the menu
        </Box>
      )}
    </HamburgerMenu>
  )
}
```

### `HamburgerMenu`
A render props component for creating hamburger menus

### Props
This component also accepts any props that the `as` component takes
- `hamburger {func}`
    - **default** function returned by `createHamburger()`
- `as {React.Component}`
    - **default** `curls/Drawer`
    - A context Provider which controls the logic for opening and closing of the collapsible menu portion
      of the hamburger menu. Its render props `show`, `hide`, `toggle`, and `isVisible` are also
      provided to the `@hamburger` function.
- `menuAs {React.Component}`
    - **default** `curls/DrawerBox`
    - The Consumer half to the `as` Provider component. It is used for rendering the collapsible menu
      portion of the hamburger menu. It also any receives any ref provided to the `HamburgerMenu` component.
- `children {func}`
    - Returns the collapsible menu of portion of the hamburger menu. It is provided as the child
      component to `menuAs`. It receives the render props from `curls/DrawerBox` by default.
      
------

### `createHamburger(<options>)`
- `options {object}`
    - `color {string}`
        - **default** `primary`
        - The `background-color` of the resulting Hamburger lines
    - `numLines {number}`
        - **default** `3`
        - The number of lines to render for the Hamburger
    - `closeButton {func}`
        - A function for rendering a close button. The function receives the props `show`, `hide`, `toggle`, 
          and `isVisible`.
    - `ref {func}`
        - A ref forwarded to the `<Button>` which wraps this component
    - `...props`
        - Additional props forwarded to the `<Button>` which wraps this component

### Hamburger line `defaultTheme`
```js

const defaultTheme = {
  color: 'primary',
  getLine: n => css`
    width: 18px;
    height: 2px;
    min-height: 2px;
    border-radius: 2px;
    margin-top: 1px;
    margin-bottom: 1px;
    position: relative;
    contain: strict;
  `
}
```