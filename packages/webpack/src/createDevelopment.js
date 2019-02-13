import createConfig from './createConfig'


export default function createDevelopment (...configs) {
  return createConfig(
    {
      devtool: 'eval',
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
