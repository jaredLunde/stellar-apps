// v1.0.0 // 3/19/2019 //
function req(plugin) {
  var module = require(plugin)
  return module.default || module
}

function isPlainObject(o) {
  if (o !== null && typeof o === 'object') {
    var proto = Object.getPrototypeOf(o)
    return proto === Object.prototype || proto === null
  }

  return false
}

function deepAssign() {
  var head = arguments[0]
  var objects = Array.prototype.slice.call(arguments, 1)

  for (var i = 0; i < objects.length; i++) {
    var next = objects[i]

    for (var key in next) {
      var nextObj = next[key]

      if (isPlainObject(nextObj) && isPlainObject(head[key])) {
        head[key] = deepAssign(head[key], nextObj)
      } else {
        head[key] = nextObj
      }
    }
  }

  return head
}

module.exports = function(api, opt) {
  var env = process.env.NODE_ENV

  if (env === 'production') {
    return {
      presets: [
        opt.env === false
          ? {}
          : [
              req('@babel/preset-env'),
              Object.assign(
                {
                  loose: true,
                  useBuiltIns: 'usage',
                  ignoreBrowserslistConfig: true,
                  exclude: ['transform-typeof-symbol'],
                },
                opt.env,
              ),
            ],
      ],

      plugins: [
        opt.runtime === false
          ? {}
          : [
              req('@babel/plugin-transform-runtime'),
              Object.assign({}, opt.runtime),
            ],
        [
          req('@babel/plugin-proposal-class-properties'),
          Object.assign({loose: true}, opt.classProps),
        ],
        [req('@babel/plugin-proposal-export-default-from'), {}],
        [req('@babel/plugin-proposal-export-namespace-from'), {}],
        [req('@babel/plugin-proposal-logical-assignment-operators'), {}],
        [req('@babel/plugin-proposal-nullish-coalescing-operator'), {}],
        [req('@babel/plugin-transform-object-assign'), {}],
        [req('@babel/plugin-proposal-object-rest-spread'), {}],
        [req('@babel/plugin-proposal-optional-chaining'), {}],
        [req('@babel/plugin-syntax-dynamic-import'), {}],
        [req('@babel/plugin-syntax-import-meta'), {}],
        opt.closureElimination === false
          ? {}
          : [req('babel-plugin-closure-elimination'), {}],
        opt.macros === false ? {} : [req('babel-plugin-macros'), {}],
        opt.devExpression === false
          ? {}
          : [req('babel-plugin-dev-expression'), {}],
      ],
    }
  } else {
    return {
      presets: [
        opt.env === false
          ? {}
          : [
              req('@babel/preset-env'),
              Object.assign(
                {
                  loose: true,
                  useBuiltIns: 'usage',
                  ignoreBrowserslistConfig: true,
                  exclude: ['transform-typeof-symbol'],
                },
                opt.env,
              ),
            ],
      ],

      plugins: [
        opt.runtime === false
          ? {}
          : [
              req('@babel/plugin-transform-runtime'),
              Object.assign({}, opt.runtime),
            ],
        [
          req('@babel/plugin-proposal-class-properties'),
          Object.assign({loose: true}, opt.classProps),
        ],
        [req('@babel/plugin-proposal-export-default-from'), {}],
        [req('@babel/plugin-proposal-export-namespace-from'), {}],
        [req('@babel/plugin-proposal-logical-assignment-operators'), {}],
        [req('@babel/plugin-proposal-nullish-coalescing-operator'), {}],
        [req('@babel/plugin-transform-object-assign'), {}],
        [req('@babel/plugin-proposal-object-rest-spread'), {}],
        [req('@babel/plugin-proposal-optional-chaining'), {}],
        [req('@babel/plugin-syntax-dynamic-import'), {}],
        [req('@babel/plugin-syntax-import-meta'), {}],
        opt.closureElimination === false
          ? {}
          : [req('babel-plugin-closure-elimination'), {}],
        opt.macros === false ? {} : [req('babel-plugin-macros'), {}],
        opt.devExpression === false
          ? {}
          : [req('babel-plugin-dev-expression'), {}],
      ],
    }
  }
}
