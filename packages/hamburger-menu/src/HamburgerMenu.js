import React from 'react'
import {Drawer, DrawerBox} from 'curls'
import createHamburger from './createHamburger'


export default React.memo(
  React.forwardRef(
    function HamburgerMenu (
      {
        as = Drawer,
        menuAs = DrawerBox,
        hamburger = createHamburger({}),
        children,
        ...props
      },
      ref
    ) {
      return React.createElement(
        as,
        {
          ...props,
          children: ({toggle, show, hide, isVisible}) => (
            <>
              {React.createElement(menuAs, {ref, children, w: '100%'})}
              {hamburger({show, hide, toggle, isVisible})}
            </>
          )
        }
      )
    }
  )
)