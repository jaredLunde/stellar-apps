import webpack from 'webpack'
import createConfig from './createConfig'


export default function createDevelopment (...configs) {
  return createConfig(
    {
      mode: 'development',
      performance: {
        hints: false
      },
      optimization: {
        moduleIds: 'hashed',
        chunkIds: 'named'
      }
    },
    ...configs
  )
}
