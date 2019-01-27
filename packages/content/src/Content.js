import React from 'react'
import PropTypes from 'prop-types'
import {createComponent, renderNode, FlexBox} from 'curls'
import {css} from '@emotion/core'


const as = 'div'
const defaultCSS = css`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
`

const defaultTheme = {
  width: 1360,
  slimWidth: null
}

const SFC = createComponent({
  name: 'Content',
  propTypes: {
    slim: PropTypes.bool
  },
  CSS: {
    __base: (val, theme) => css`max-width: ${theme.width}px;`,
    slim: (val, theme) => val === true && (
      css`max-width: ${theme.slimWidth || theme.width * 0.61803398875}px;`
    )
  },
  defaultTheme,
  themePath: 'content'
})


export default React.forwardRef(
  function Content (props, innerRef) {
    return SFC({
      __base: true,
      innerRef,
      ...props,
      children: function (boxProps) {
        boxProps.children = function (nodeProps) {
          nodeProps.children = props.children
          nodeProps.as = nodeProps.as || as
          delete nodeProps.__base

          return renderNode(nodeProps, defaultCSS)
        }

        return FlexBox(boxProps)
      }
    })
  }
)
