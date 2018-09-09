'use strict'
const path = require('path')

module.exports = {
  dev: {
    template: path.resolve(__dirname, '../public/index.html'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',

    proxyTable: {},
    host: 'localhost',
    port: 3001,
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false,
    useEslint: false,
    showEslintErrorsInOverlay: false,
    devtool: 'cheap-module-eval-source-map',
    cacheBusting: false,
    cssSourceMap: true
  },
  build: {
    template: path.resolve(__dirname, '../public/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    entryMain: path.resolve(__dirname, '../src/main.js'),
    productionSourceMap: false,
    devtool: '#source-map',
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    bundleAnalyzerReport: process.env.npm_config_report
  }
}
