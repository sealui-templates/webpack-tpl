/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const chalk = require('chalk');
const url = require('url');
const globalModules = require('global-modules');
const fs = require('fs');

function printHostingInstructions(
  appPackage,
  publicUrl,
  publicPath,
  buildFolder,
  useYarn
) {
  if (publicUrl && publicUrl.includes('.github.io/')) {
    // "homepage": "http://user.github.io/project"
    const publicPathname = url.parse(publicPath).pathname;
    const hasDeployScript = typeof appPackage.scripts.deploy !== 'undefined';
    printBaseMessage(buildFolder, publicPathname);

    printDeployInstructions(publicUrl, hasDeployScript, useYarn);
  } else if (publicPath !== '/') {
    // "homepage": "http://mywebsite.com/project"
    printBaseMessage(buildFolder, publicPath);
  } else {
    // "homepage": "http://mywebsite.com"
    //   or no homepage
    printBaseMessage(buildFolder, publicUrl);

    printStaticServerInstructions(buildFolder, useYarn);
  }
  console.log();
}

function printBaseMessage(buildFolder, hostingLocation) {
  console.log(
    `项目运行在 ${chalk.green(
      hostingLocation || 'the server root'
    )}.`
  );
  console.log(
    `您可以使用 ${chalk.cyan('package.json')} 中的 ${chalk.green(
      'homepage'
    )} 字段来控制它`
  );

  if (!hostingLocation) {
    console.log('例如：你可以把项目发布在 GitHub Pages:');
    console.log();

    console.log(
      `  ${chalk.green('"homepage"')} ${chalk.cyan(':')} ${chalk.green(
        '"http://myname.github.io/myapp"'
      )}${chalk.cyan(',')}`
    );
  }
  console.log();
  console.log(`${chalk.cyan(buildFolder)} 文件夹已准备好部署`)
}

function printDeployInstructions(publicUrl, hasDeployScript, useYarn) {
  console.log(`如果要发布到 ${chalk.green(publicUrl)}, 请运行:`);
  console.log();

  // If script deploy has been added to package.json, skip the instructions
  if (!hasDeployScript) {
    if (useYarn) {
      console.log(`  ${chalk.cyan('yarn')} add --dev gh-pages`);
    } else {
      console.log(`  ${chalk.cyan('npm')} install --save-dev gh-pages`);
    }
    console.log();

    console.log(
      `在 ${chalk.cyan('package.json')} 中添加以下脚本`
    );
    console.log();

    console.log(`    ${chalk.dim('// ...')}`);
    console.log(`    ${chalk.yellow('"scripts"')}: {`);
    console.log(`      ${chalk.dim('// ...')}`);
    console.log(
      `      ${chalk.yellow('"predeploy"')}: ${chalk.yellow(
        `"${useYarn ? 'yarn' : 'npm run'} build",`
      )}`
    );
    console.log(
      `      ${chalk.yellow('"deploy"')}: ${chalk.yellow(
        '"gh-pages -d build"'
      )}`
    );
    console.log('    }');
    console.log();

    console.log('然后运行:');
    console.log();
  }
  console.log(`  ${chalk.cyan(useYarn ? 'yarn' : 'npm')} run deploy`);
}

function printStaticServerInstructions(buildFolder, useYarn) {
  console.log('您可以使用静态服务器来服务它:');
  console.log();

  if (!fs.existsSync(`${globalModules}/serve`)) {
    if (useYarn) {
      console.log(`  ${chalk.cyan('yarn')} global add serve`);
    } else {
      console.log(`  ${chalk.cyan('npm')} install -g serve`);
    }
  }
  console.log(`  ${chalk.cyan('serve')} -s ${buildFolder}`);
}

module.exports = printHostingInstructions;
