// v1.0.1 // 1/24/2019 //

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
      presets: [[req('@babel/preset-react'), {}]],

      plugins: [
        opt.transformConstant === false
          ? {}
          : [req('@babel/plugin-transform-react-constant-elements'), {}],
        opt.removePropTypes === false
          ? {}
          : [req('babel-plugin-transform-react-remove-prop-types'), {}],
        opt.transformPure === false
          ? {}
          : [req('babel-plugin-transform-react-pure-components'), {}],
      ],
    }
  } else {
    return {
      presets: [[req('@babel/preset-react'), {}]],

      plugins: [],
    }
  }
}
