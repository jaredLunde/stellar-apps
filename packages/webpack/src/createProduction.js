import createConfig from './createConfig'


export default function createProduction (...configs) {
  return createConfig(
    {
      devtool: false,
      mode: 'production',

      plugins: [
        new webpack.HashedModuleIdsPlugin({
          hashFunction: 'md4',
          hashDigest: 'base64'
        })
      ],

      performance: {
        hints: false
      },

      optimization: {
        noEmitOnErrors: true,
        moduleIds: 'total-size',
        chunkIds: 'total-size'
      },
    },
    ...configs
  )
}
