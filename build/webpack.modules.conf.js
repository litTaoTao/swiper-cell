var path = require('path')
var fs = require('fs')
var merge = require('webpack-merge')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var config = require('../config')
var utils = require('./utils')
var baseWebpackConfig = require('./webpack.base.conf')

var modules = {}
var cPath = path.join(__dirname, '../src/modules')
var files = fs.readdirSync(cPath)
if (files) {
    files.forEach(function (name) {
        var p = path.join(cPath, name)
        if (fs.statSync(p).isDirectory()) {
            modules[name] = p
        }
    })
}

var webpackConfig = merge(baseWebpackConfig, {
    entry: modules,
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.build.productionSourceMap,
            extract: {
                publicPath: '../'
            }
        })
    },
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('[name]/index.js'),
        library: ['Tao', '[name]'],
        libraryTarget: 'umd'
    },
    plugins: [
        // extract css into its own file
        new ExtractTextPlugin(utils.assetsPath('[name]/style.css'))
    ]
})

module.exports = webpackConfig