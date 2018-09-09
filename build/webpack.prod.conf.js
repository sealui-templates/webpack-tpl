'use strict';

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const utils = require('./utils')
const config = require('./config')
const webpackBaseConf = require('./webpack.base.conf')

const webpackProdConf = merge(webpackBaseConf, {
  mode: 'production',
  bail: true,
  devtool: false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[chunkhash:8].js'),
    chunkFilename: utils.assetsPath('js/[chunkhash:8].js'),
    publicPath: config.build.assetsPublicPath,
    devtoolModuleFilenameTemplate: info =>
      path
        .relative(utils.resolve('src'), info.absoluteResourcePath)
        .replace(/\\/g, '/'),
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
        cache: true,
        sourceMap: false,
      }),
      new OptimizeCSSAssetsPlugin({ cssProcessorOptions: { safe: true } }),
    ],
    splitChunks: {
      chunks: 'all',
      name: 'vendors',
    },
    runtimeChunk: {
      name: entrypoint => `runtimechunk~${entrypoint.name}`
    }
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash:8].css'),
      chunkFilename: utils.assetsPath('css/[name].[contenthash:8].chunk.css'),
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: config.build.template,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackProdConf.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

module.exports = webpackProdConf
