/* globals env, rm, mkdir */
// https://github.com/shelljs/shelljs
require('shelljs/global')
env.NODE_ENV = 'production'

var path = require('path')
var settings = require('../settings')
var ora = require('ora')
var webpack = require('webpack')
var webpackConfig = require('./webpack.prod.conf')

console.log(
  '  Tip:\n' +
  '  Built files are meant to be served over an HTTP server.\n' +
  '  Opening index.html over file:// won\'t work.\n' +
  '  But you can test build with: cd build && python -m SimpleHTTPServer 3001 \n'
)
var spinner = ora('building for production...')
spinner.start()

var assetsPath = path.join(settings.build.assetsRoot, settings.build.assetsSubDirectory)
rm('-rf', settings.build.assetsRoot)
mkdir('-p', assetsPath)

webpack(webpackConfig, function (err, stats) {
  spinner.stop()
  if (err) {throw err}
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  }) + '\n')
})