import writeFile from './writeFile'


export default function writeJson (fn, data, indent = 2) {
  return writeFile(fn, JSON.stringify(data, null, indent))
}