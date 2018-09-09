'use strict'

process.env.NODE_ENV = 'production'

const fs = require('fs-extra')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('../webpack.prod.conf')

const { checkBrowsers, printBrowsers } = require('../dev-utils/browsersHelper');
const FileSizeReporter = require('../dev-utils/fileSizeReporter');
const formatWebpackMessages = require('../dev-utils/formatWebpackMessages');
const printHostingInstructions = require('../dev-utils/printHostingInstructions');
const printBuildError = require('../dev-utils/printBuildError');

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const envPublicUrl = process.env.PUBLIC_URL;
const argv = process.argv.slice(2);
const writeStatsJson = argv.indexOf('--stats') !== -1;

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage;

const paths = {
  appPath: path.join(__dirname, '../../'),
  appPublic: path.join(__dirname, '../../public'),
  appPackageJson: path.join(__dirname, '../../package.json'),
  publicUrl: getPublicUrl(path.join(__dirname, '../../package.json')),
  publicPath: webpackConfig.output.publicPath,
  appBuild: config.build.assetsRoot,
  appHtml: path.join(__dirname, '../../public/index.html')
}

checkBrowsers(paths.appPath)
  .then(() => {
    return measureFileSizesBeforeBuild(paths.appBuild);
  })
  .then(previousFileSizes => {
    fs.emptyDirSync(paths.appBuild)
    copyPublicFolder()
    return build(previousFileSizes)
  })
  .then(
    ({ stats, previousFileSizes, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('编译警告.\n'));
        console.log(warnings.join('\n\n'));
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        );
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        );
      } else {
        console.log(chalk.green('✔ 🌷 编译成功.\n'));
      }

      console.log('文件经过gzip压缩后:\n');
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        paths.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      );
      console.log();

      const appPackage = require(paths.appPackageJson);
      const publicUrl = paths.publicUrl;
      const publicPath =paths.publicPath;
      const buildFolder = path.relative(process.cwd(), paths.appBuild);
      printHostingInstructions(
        appPackage,
        publicUrl,
        publicPath,
        buildFolder,
        false
      );
      printBrowsers(paths.appPath);
    },
    err => {
      console.log(chalk.red('✘ ⚡ 编译错误.\n'));
      printBuildError(err);
      process.exit(0);
    }
  )
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });

function build(previousFileSizes) {
  console.log(`开始编译生产环境...`)
  console.log()
  let compiler = webpack(webpackConfig);
  return new Promise((resolve, reject) => {
    // spinner.start()
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      const messages = formatWebpackMessages(stats.toJson({}, true));
      if (messages.errors.length) {
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }

      const resolveArgs = {
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      };

      if (writeStatsJson) {
        return bfj
          .write(paths.appBuild + '/bundle-stats.json', stats.toJson())
          .then(() => resolve(resolveArgs))
          .catch(error => reject(new Error(error)));
      }

      return resolve(resolveArgs);
    })
  })

}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}
