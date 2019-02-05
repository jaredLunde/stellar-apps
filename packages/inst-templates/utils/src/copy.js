import fs from 'fs-extra'
import path from 'path'
import ncp from 'ncp'


ncp.limit = 16

export default async function copy (from, to, {include, exclude}) {
  const dir = path.dirname(to)

  if (fs.existsSync(dir) === false) {
    await fs.ensureDir(dir, 0o744)
  }

  return new Promise(
    (resolve, reject) => ncp(
      from,
      to,
      {
        filter: (source) => {
          if (typeof exclude === 'function') {
            return exclude(source) === false
          }

          if (typeof include === 'function') {
            return include(source)
          }

          return true
        }
      },
      err => {
        if (err) {
          reject(err)
        }

        resolve()
      }
    )
  )
}
