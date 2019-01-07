const desktopBreakPoints = ['lg', 'xl', 'xxl']
const tabletBreakPoints = ['md', 'lg']
const mobileBreakPoints = ['xxs', 'xs', 'sm', 'md']


export default function getDefaultMatches (...from) {
  return function (theme) {
    const accumulate = []

    for (let x = 0; x < from.length; x++) {
      const bp = from[x]
      let breakPoints = []

      switch(theme.device) {
        case 'desktop':
          breakPoints = desktopBreakPoints
          break;
        case 'tablet':
          breakPoints = tabletBreakPoints
          break;
        case 'mobile':
          breakPoints = mobileBreakPoints
          break;
      }

      if (breakPoints.indexOf(bp) > -1) {
        accumulate.push(bp)
      }
    }

    return accumulate
  }
}