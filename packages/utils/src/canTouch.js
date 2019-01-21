let cached
const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ')

export default function canTouch () {
  if (cached !== void 0) {
    return cached
  }

  if (typeof window === 'undefined') {
    cached = false
    return false
  }

  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    cached = true
    return true
  }

  const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('')
  cached = window.matchMedia(query).matches
  return cached
}