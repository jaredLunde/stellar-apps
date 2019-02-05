import pkgUp from 'pkg-up'
import path from 'path'


export default async function getPkgDir (pkgName) {
  const dir = await pkgUp(require.resolve(pkgName))
  return dir === null ? null : path.dirname(dir)
}

export async function getPkgLib (pkgName) {
  const pkgDir = await getPkgDir(pkgName)
  return pkgDir === null ? null : path.join(pkgDir, 'lib')
}