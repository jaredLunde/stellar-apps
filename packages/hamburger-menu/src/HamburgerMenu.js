/** @jsx jsx */
import React from 'react'
import {jsx, Drawer, DrawerBox} from 'curls'
import createHamburger from './createHamburger'


const containerPropNames = [
  'fromBottom',
  'fromLeft',
  'fromRight',
  'fromTop',
  'duration',
  'enterDelay',
  'leaveDelay',
  'delay',
  'easing',
  'visible',
  'transition',
  'initiallyVisible'
]

const HamburgerMenu = React.memo(
  React.forwardRef(
    (
      {
        as = Drawer,
        menuAs = DrawerBox,
        hamburger = createHamburger({}),
        children,
        ...props
      },
      ref
    ) => {
      const containerProps = {}

      for (let k in props) {
        if (containerPropNames.includes(k)) {
          containerProps[k] = props[k]
          delete props[k]
        }
      }

      return React.createElement(
        as,
        {
          ...containerProps,
          children: ({toggle, show, hide, isVisible}) => (
            <>
              {React.createElement(menuAs, {ref, children, w: '100%', ...props})}
              {hamburger({show, hide, toggle, isVisible})}
            </>
          )
        }
      )
    }
  )
)

if (__DEV__) HamburgerMenu.displayName = 'HamburgerMenu'
export default HamburgerMenu