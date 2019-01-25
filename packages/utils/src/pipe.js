export default function pipe () {
  let x, val, fns = [].slice.call(arguments)

  return function piped () {
    for (x = 0; x < fns.length; x++) {
      val = x === 0 ? fns[x].apply(null, arguments) : fns[x](val)
    }

    return val
  }
}