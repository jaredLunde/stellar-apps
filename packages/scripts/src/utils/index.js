import path from 'path'
import chalk from 'chalk'
import {pwd as instPwd} from '@inst-pkg/template-utils'


export {cmd} from '@inst-pkg/template-utils'
export writeFile from './writeFile'
export writeJson from './writeJson'
export const log = (...msgs) => console.log('❈', ...msgs)
export const error = (...msgs) => log(flag('Error', 'red'), ...msgs)
export const success = (...msgs) => console.log(flag('❈', 'green'), ...msgs)
export const flag = (msg, color = 'white') => `${chalk.bold[color](msg)}`
export const pwd = (cwd = process.env.INIT_CWD) =>
  cwd ? path.isAbsolute(cwd) ? cwd : path.join(instPwd(), cwd) : instPwd()
export async function wait (timeInSeconds) {
  await new Promise(resolve => setTimeout(resolve, timeInSeconds * 1000))
}