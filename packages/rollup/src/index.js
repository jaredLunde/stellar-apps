import babelMerge from 'babel-merge'
import alias_ from 'rollup-plugin-alias'
import commonjs_ from 'rollup-plugin-commonjs'
import nodeResolve_ from 'rollup-plugin-node-resolve'
import babel_ from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'


export default ({
  input,
  output,
  runtime = 10,
  babel = {},
  alias = {},
  commonjs = {},
  nodeResolve ={},
  plugins = []
}) => ({
  // the input parameter is your main Lambda module file
  input,
  output: {
    format: 'cjs',
    ...output
  },
  plugins: [
    // if you `require('./some.json')` in RollupJS you
    // will need the JSON plugin
    json(),
    // you will almost certainly want to resolve files
    // using the NodeJS module resolution algorithm
    nodeResolve_({
      // the fields to scan in a package.json to determine the entry point
      // of a given package
      mainFields: ['module', 'jsnext', 'esnext', 'jsnext:main', 'main'],
      // the AWS Lambda environment is NodeJS@6.10 so we
      // can use system modules like `fs`
      preferBuiltins: true,
      // if you want to resolve anything more than `.js`
      // files you will need to specify them here
      extensions: ['.mjs', '.js', '.jsx'],
      ...nodeResolve
    }),
    // unless you are not using system modules and only
    // using strict ECMA imports, you'll want to include
    // CommonJS resolution in your rollup, which means that
    // tree shaking doesn't make as small a bundle, but
    // that's not going to be an issue in a Lambda instance
    commonjs_({
      ...commonjs,
      ignore: [
        // the AWS Lambda runtime includes `aws-sdk` module
        // so we can ignore it from our built bundle and
        // use that instead
        'aws-sdk',
        // these are NodeJS core modules, which I would have
        // thought that we didn't need to ignore with the
        // `nodeResolve.preferBuiltins` option, but here we
        // are ignoring them still...
        'assert',
        'buffer',
        'child_process',
        'cluster',
        'console',
        'constants',
        'crypto',
        'dgram',
        'dns',
        'domain',
        'events',
        'fs',
        'http',
        'https',
        'module',
        'net',
        'os',
        'path',
        'process',
        'punycode',
        'querystring',
        'readline',
        'repl',
        'stream',
        'string_decoder',
        'timers',
        'tls',
        'tty',
        'url',
        'util',
        'vm',
        'zlib',
        ...commonjs.ignore
      ]
    }),
    // in order to run in the NodeJS@6.10 environment, we
    // need to transpile down to an older JS version
    babel_({
      // in this CLI tool we will ignore any babel config
      // file found in the folder, but you probably will
      // want to specify a babelrc file in your real build
      babelrc: false,
      presets: [
        [
          'env',
          {
            targets: {
              node: runtime,
            },
            modules: false,
          },
        ],
      ],
      plugins: [

      ],
    }),
    alias_({
      ...alias
    }),
    ...plugins
  ],
})