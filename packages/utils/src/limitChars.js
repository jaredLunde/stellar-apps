export default function limitChars(string, numChars, ellipsis = '…') {
  if (string.length < numChars) {
    return string
  }

  let output = ''
  let size = 0

  for (let word of string.split(' ')) {
    const wordLen = word.length

    if (wordLen > numChars) {
      return `${output.length ? output.trim() : word.substr(0, numChars)}${ellipsis}`
    }

    output += `${word} `
    size += wordLen

    if (size >= numChars) {
      return `${output.trim()}${ellipsis}`
    }
  }

  return output.trim()
}