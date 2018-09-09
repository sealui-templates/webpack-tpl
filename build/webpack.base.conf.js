'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ModuleScopePlugin = require('./dev-utils/moduleScopePlugin');

const pkg = require('../package.json')
const utils = require('./utils')
const config = require('./config')

const NODE_ENV = process.env.NODE_ENV


const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;
const stylusRegex = /\.styl(us)?$/;
const stylusModuleRegex = /\.module\.styl(us)?$/;

module.exports = {
  context: utils.resolve('.'),
  entry: [
    utils.resolve('src/index.js')
  ],
  output: {
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js',
    publicPath: config.dev.assetsPublicPath,
    libraryTarget: 'umd',
    library: 'SEALUI',
    umdNamedDefine : true
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'vendors',
    },
    runtimeChunk: true,
  },
  resolve: {
    extensions: ['.web.js', '.mjs', '.js', '.json'],
    alias: {
      '@': '../src'
    },
    plugins: [
      new ModuleScopePlugin(utils.resolve('src'), [utils.resolve('package.json')]),
    ]
  },
  module: {
    strictExportPresence: true,
    rules: [
      { parser: { requireEnsure: false } },
      {
        test: /\.(js|jsx|mjs)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              eslintPath: require.resolve('eslint'),
              baseConfig: {
                extends: [require.resolve('eslint-config-standard')],
              },
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: utils.resolve('src'),
        exclude: [/[/\\\\]node_modules[/\\\\]/],
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: utils.assetsPath('media/[name].[hash:8].[ext]'),
            },
          },
          {
            test: /\.(js|jsx|mjs)$/,
            include: utils.resolve('src'),
            exclude: [/[/\\\\]node_modules[/\\\\]/],
            use: [
              {
                loader: require.resolve('thread-loader'),
                options: {
                  poolTimeout: Infinity
                },
              },
              {
                loader: require.resolve('babel-loader'),
                options: {
                  // presets: [require.resolve('babel-preset-react-app')],
                  cacheDirectory: true,
                  highlightCode: true,
                },
              },
            ],
          },
          {
            test: /\.js$/,
            use: [
              {
                loader: require.resolve('thread-loader'),
                options: {
                  poolTimeout: Infinity
                },
              },
              {
                loader: require.resolve('babel-loader'),
                options: {
                  babelrc: false,
                  compact: false,
                  cacheDirectory: true,
                  highlightCode: true,
                },
              },
            ],
          },
        ]
      }
    ]
  },
  plugins: [
    // new ProgressBarPlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(NODE_ENV),
      'version': JSON.stringify(pkg.version)
    }),
    new webpack.BannerPlugin({
      banner: 'SealUI'
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  performance: false,
}
