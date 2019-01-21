// Copies a string to the clipboard. Must be called from within an event handler such as click.
// May return false if it failed, but this is not always
// possible. Browser support for Chrome 43+, Firefox 42+, Edge and IE 10+.
// No Safari support, as of (Nov. 2015). Returns false.
// IE: The clipboard feature may be disabled by an adminstrator. By default a prompt is
// shown the first time the clipboard is used (per session).
export default function copyToClipboard (text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return clipboardData.setData('Text', text)
  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    const textarea = document.createElement('textarea')
    // Prevent scrolling to bottom of page in MS Edge.
    textarea.style.position = 'fixed'
    textarea.style.top = 0
    textarea.style.fontSize = '1rem'
    textarea.textContent = text
    document.body.appendChild(textarea)
    textarea.select()

    try {
      // Security exception may be thrown by some browsers.
      return document.execCommand('copy')
    } catch (ex) {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}