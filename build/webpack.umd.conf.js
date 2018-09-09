'use strict';
const path = require('path');
const webpack = require('webpack');
const chalk = require('chalk')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const utils = require('./utils')

const webpackUmdConf = {
  mode: 'production',
  bail: true,
  context: utils.resolve('.'),
  entry: ['./src/index.js'],
  output: {
    path: path.resolve(process.cwd(), './lib'),
    publicPath: '/dist/',
    filename: 'index.min.js',
    libraryTarget: 'umd',
    library: 'SEALUI',
    umdNamedDefine: true
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            // drop_console: true,
            ecma: 5,
            warnings: false,
            comparisons: false,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            ascii_only: true,
          },
        },
        parallel: true,
        cache: true,
        sourceMap: false
      })
    ]
  },
  resolve: {
    extensions: ['.web.js', '.mjs', '.js', '.json'],
    alias: {
      '@': '../src'
    }
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
    new ProgressBarPlugin({
      format: chalk.green.bold('  build [:bar] ') + chalk.green.bold(':percent') + ' (耗时 :elapsed 秒)',
      clear: true
    }),
    new webpack.BannerPlugin({
      banner: '112312312312'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
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

return new Promise((resolve, reject) => {
  webpack(webpackUmdConf, (err, stats) => {
    if (err) {
      reject(err);
    } else {
      if (stats.hasErrors()) {
       return reject(`编译错误`);
      }
      resolve(stats);
    }
  })
}).then((stats) => {
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n\n')

  console.log(chalk.green('  编译完成.\n'))
  process.exit(0)

}).catch((err) => {
  console.log(chalk.green('编译错误', err))
  process.exit(0)
});

