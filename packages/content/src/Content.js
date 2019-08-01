import {css, useStyles, createComponent, useBox, pushCss, memoThemeValue} from 'curls'

const
  defaultStyles = css`
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  `,
  options = {
    name: 'content',
    styles: {
      __content_defaults: memoThemeValue((val, theme) => css`max-width: ${theme?.content?.width || 1360}px;`),
      slim: memoThemeValue((val, theme) => val === true && (
        css`max-width: ${theme?.content?.slimWidth || (theme?.content?.width || 1360) * 0.61803398875}px;`
      ))
    }
  }

export const
  useContent = props => useStyles(
    options,
    pushCss(Object.assign({__content_defaults: true}, props), defaultStyles)
  ),
  Content = createComponent('div', props => useBox(useContent(props)))

if (__DEV__) {
  const PropTypes = require('prop-types')
  Content.displayName = 'Content'
  Content.propTypes = {slim: PropTypes.bool}
}