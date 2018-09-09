'use strict';

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const utils = require('./utils')
const config = require('./config')
const webpackBaseConf = require('./webpack.base.conf')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)


const webpackDevConf = merge(webpackBaseConf, {
  mode: 'development',
  devtool: config.dev.devtool,
  output: {
    pathinfo: true,
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: config.dev.template,
      inject: true,
      releaseTime: +new Date()
    })
  ],
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') }
      ]
    },
    hot: true,
    contentBase: false,
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true,
    watchOptions: {
      poll: config.dev.poll
    }
  }
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      process.env.PORT = port
      webpackDevConf.devServer.port = port
      webpackDevConf.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${webpackDevConf.devServer.host}:${port}`]
        },
        onErrors: config.dev.notifyOnErrors
          ? utils.createNotifierCallback()
          : undefined
      }))

      resolve(webpackDevConf)
    }
  })
})
