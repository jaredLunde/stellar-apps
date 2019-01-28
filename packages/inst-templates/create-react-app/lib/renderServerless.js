const path = require('path')
const appPaths = require('./config/paths')
module.exports = require(path.join(appPaths.serverDist, 'render.js'))
