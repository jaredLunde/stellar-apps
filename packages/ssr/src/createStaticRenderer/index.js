import {defaultMinifyConfig, defaultBeautifyConfig, defaultRenderError} from '../createRenderer'


// this creates an http handler
export default function createStaticRenderer(
  // function which generates the HTML markup for the app
  render,
  // callback for returning error pages
  renderError = defaultRenderError,
  // options for minify/beautify
  options = {}
) {
  const minify =
    options.minify === true || options.minify === void 0 || options.minify == null
      ? defaultMinifyConfig
      : options.minify
  const beautify =
    options.beautify === true || options.beautify === void 0 || options.beautify == null
      ? defaultBeautifyConfig
      : options.beautify

  return async function handler (locals) {
    let html

    try {
      html = await render(locals)
    }
    catch (err) {
      html = renderError ? await renderError({...locals, err}) : err

      if (process.env.NODE_ENV !== 'production') {
        console.log(err)
      }
    }

    // prettifies the output in dev for better debugging
    if (process.env.NODE_ENV !== 'production') {
      html = beautify ? require('js-beautify').html(html, beautify) : html
    }

    if (process.env.NODE_ENV === 'production') {
      html = minify ? require('@stellar-apps/html-minifier').minify(html, minify) : html
    }

    return html
  }
}
