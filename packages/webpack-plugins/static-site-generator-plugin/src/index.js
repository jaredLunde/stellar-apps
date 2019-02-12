// This is an update of Mark Dagleish's static-site-generator-webpack-plugin
// https://github.com/markdalgleish/static-site-generator-webpack-plugin
import RawSource from 'webpack-sources/lib/RawSource'
import evaluate from 'eval'
import path from 'path'
import cheerio from 'cheerio'
import url from 'url'


class StaticSiteGeneratorPlugin {
  constructor (options = {}) {
    if (arguments.length > 1) {
      options = legacyArgsToOptions.apply(null, arguments)
    }

    this.entry = options.entry
    this.paths = Array.isArray(options.paths) ? options.paths : [options.paths || '/']
    this.locals = options.locals
    this.globals = options.globals
    this.crawl = Boolean(options.crawl)
  }

  apply (compiler) {
    addThisCompilationHandler(compiler, compilation => {
      addOptimizeAssetsHandler(compilation, (_, done) => {
        let webpackStats = compilation.getStats()
        let webpackStatsJson = webpackStats.toJson()

        try {
          let asset = findAsset(this.entry, compilation, webpackStatsJson)

          if (asset == null) {
            throw new Error('Source file not found: "' + this.entry + '"')
          }

          let assets = getAssetsFromCompilation(compilation, webpackStatsJson)

          let source = asset.source()
          let render = evaluate(
            source,       // filename
            this.entry,   // scope
            this.globals, // includeGlobals
            true,
          )

          if (render.default !== void 0) {
            render = render['default']
          }

          if (typeof render !== 'function') {
            throw new Error('Export from "'
              + this.entry
              + '" must be a function that returns an HTML string. Is output.libraryTarget in the configuration set to "umd"?')
          }

          renderPaths(
            this.crawl,
            this.locals,
            this.paths,
            render,
            assets,
            webpackStats,
            compilation,
            new Map()
          ).then(() => done())
        } catch (err) {
          compilation.errors.push(err.stack)
          done()
        }
      })
    })
  }
}


const renderPaths = (crawl, userLocals, paths, render, assets, webpackStats, compilation, seen) => {
  let renderPromises = paths.map(async function (outputPath) {
    let locals = {path: outputPath, assets, webpackStats}

    for (let prop in userLocals) {
      if (userLocals.hasOwnProperty(prop)) {
        locals[prop] = userLocals[prop]
      }
    }

    try {
      if (seen.get(locals.path)) {
        return Promise.resolve(seen.get(locals.path))
      }

      seen.set(locals.path, true)
      let output = await render(locals)
      let outputByPath = typeof output === 'object' ? output : makeObject(outputPath, output)

      let assetGenerationPromises = Object.keys(outputByPath).map(function (key) {
        let rawSource = outputByPath[key]
        let assetName = pathToAssetName(key)

        if (compilation.assets[assetName]) {
          return
        }

        compilation.assets[assetName] = new RawSource(rawSource)

        if (crawl) {
          let relativePaths = relativePathsFromHtml({source: rawSource, path: key})

          return renderPaths(
            crawl,
            userLocals,
            relativePaths,
            render,
            assets,
            webpackStats,
            compilation,
            seen
          )
        }
      })

      return Promise.all(assetGenerationPromises)
    }
    catch (err) {
      compilation.errors.push(err.stack)
    }
  })

  return Promise.all(renderPromises)
}

const findAsset = (src, compilation, webpackStatsJson) => {
  if (!src) {
    let chunkNames = Object.keys(webpackStatsJson.assetsByChunkName)
    src = chunkNames[0]
  }

  let asset = compilation.assets[src]

  if (asset) {
    return asset
  }

  let chunkValue = webpackStatsJson.assetsByChunkName[src]

  if (!chunkValue) {
    return null
  }
  // Webpack outputs an array for each chunk when using sourcemaps
  if (Array.isArray(chunkValue)) {
    // Is the main bundle always the first element?
    chunkValue = chunkValue.find(jsRe.test.bind(jsRe))
  }

  return compilation.assets[chunkValue]
}

const jsRe = /\.js$/
// Shamelessly stolen from html-webpack-plugin - Thanks @ampedandwired :)
const getAssetsFromCompilation = (compilation, webpackStatsJson) => {
  let assets = {}

  for (let chunk in webpackStatsJson.assetsByChunkName) {
    let chunkValue = webpackStatsJson.assetsByChunkName[chunk]

    // Webpack outputs an array for each chunk when using sourcemaps
    if (Array.isArray(chunkValue)) {
      // Is the main bundle always the first JS element?
      chunkValue = chunkValue.find(jsRe.test.bind(jsRe))
    }

    if (compilation.options.output.publicPath) {
      chunkValue = compilation.options.output.publicPath + chunkValue
    }

    assets[chunk] = chunkValue
  }

  return assets
}

const slashRe = /^(\/|\\)/
const htmlRe = /\.(html?)$/i

const pathToAssetName = outputPath => {
  let outputFileName = outputPath.replace(slashRe, '')

  if (htmlRe.test(outputFileName) === false) {
    outputFileName = path.join(outputFileName, 'index.html')
  }

  return outputFileName
}

const makeObject = (key, value) => {
  let obj = {}
  obj[key] = value
  return obj
}

const relativePathsFromHtml = options => {
  let html = options.source
  let currentPath = options.path

  let $ = cheerio.load(html)

  let linkHrefs = $('a[href]').map((i, el) => $(el).attr('href')).get()
  let iframeSrcs = $('iframe[src]').map((i, el) => $(el).attr('src')).get()

  return []
    .concat(linkHrefs)
    .concat(iframeSrcs)
    .map(href => {
      if (href.indexOf('//') === 0) {
        return null
      }

      let parsed = url.parse(href)

      if (parsed.protocol || typeof parsed.path !== 'string') {
        return null
      }

      return parsed.path.indexOf('/') === 0 ? parsed.path : url.resolve(currentPath, parsed.path)
    })
    .filter(href => href !== null)
}

const legacyArgsToOptions = (entry, paths, locals, globals) => {
  return {
    entry: entry,
    paths: paths,
    locals: locals,
    globals: globals,
  }
}

const addThisCompilationHandler = (compiler, callback) => {
  compiler.hooks.thisCompilation.tap('static-site-generator-plugin', callback)
}

const addOptimizeAssetsHandler = (compilation, callback) => {
  compilation.hooks.optimizeAssets.tapAsync('static-site-generator-plugin', callback)
}

module.exports = StaticSiteGeneratorPlugin
