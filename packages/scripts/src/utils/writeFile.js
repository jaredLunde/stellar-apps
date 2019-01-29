import fs from 'fs'
import {promisify} from "util"


const writeFileP = promisify(fs.writeFile)

export default async function writeFile (fn, data) {
  const tmpFn = `${fn}.tmp`
  const res = await writeFileP(tmpFn, data)
  fs.renameSync(tmpFn, fn)
  return res
}