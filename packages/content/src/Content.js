import React from 'react'
import PropTypes from 'prop-types'
import {createComponent, renderNode, FlexBox, memoThemeValue} from 'curls'
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
  name: 'content',
  styles: {
    __base: memoThemeValue((val, theme) => css`max-width: ${theme.width}px;`),
    slim: memoThemeValue((val, theme) => val === true && (
      css`max-width: ${theme.slimWidth || theme.width * 0.61803398875}px;`
    ))
  },
  defaultTheme
})

const Content = React.forwardRef(
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

export default Content
Content.propTypes /* remove-proptypes */ = {slim: PropTypes.bool}