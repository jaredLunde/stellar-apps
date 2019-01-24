import webpack from 'webpack'
import DevServer from 'webpack-dev-server'
import Jarvis from 'webpack-jarvis'
import WriteFilePlugin from 'write-file-webpack-plugin'


export default function startDevServer ({config, port = 3000, ...opt}) {
  config = {
    ...config,
    plugins: [
      ...config.plugins,
      new WriteFilePlugin(),
      new Jarvis({port: port - 3000 + 1337})
    ]
  }

  const options = {
    publicPath: config.output.publicPath,
    compress: true,
    historyApiFallback: true,
    disableHostCheck: true,
    host: '0.0.0.0',
    quiet: true,
    hot: true,
    ...opt
  }

  DevServer.addDevServerEntrypoints(config, options)
  const compiler = webpack(config)
  const server = new DevServer(compiler, options)

  server.listen(
    port,
    '0.0.0.0',
    function (err, result) {
      console.log(`[Inst FastDev®] http://0.0.0.0:${port} `)
    }
  )

}
