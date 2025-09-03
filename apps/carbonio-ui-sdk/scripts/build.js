/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable no-console */
const chalk = require('chalk');
const webpack = require('webpack');
const { commitHash } = require('./utils/setup');
const { setupWebpackBuildConfig } = require('./configs/webpack.build.config');
const { setupWebpackExternalBuildConfig } = require('./configs/webpack.external.config');
const {logBuild, printArgs} = require('./utils/console');
const { rmSync } = require('node:fs');
const path = require('path');
const fs = require('fs');

exports.command = 'build';
exports.desc = 'Compile and bundle your project';
exports.builder = {
	analyze: {
		desc: 'Apply the BundleAnalyzerPlugin and launch its web ui after the compilation',
		default: false,
		boolean: true
	},
	dev: {
		desc: 'Build in devMode',
		alias: 'd',
		default: false,
		boolean: true
	},
	external: {
		desc: 'Run an additional build for external resources',
		alias: 'e',
		default: false,
		boolean: true
	},
	pkgRel: {
		desc: 'pkgRel value to pass to the PKGBUILD template',
		default: '1',
	}
};

const runExternalBuild = (options, buildSetup) => new Promise((...p) => {
		console.log('Building ==> ', chalk.bold.yellow('external '), chalk.green(options.name));
		console.log('Using base path ==> ', chalk.green(buildSetup.basePath));
		const externalConfig = setupWebpackExternalBuildConfig(options, buildSetup);
		const compilerExternal = webpack(externalConfig);
		compilerExternal.run(logBuild(p, options));
});
function getAppName() {
  try {
    // Find nearest package.json for the app or package
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return pkg.name || path.basename(process.cwd());
    }
    return path.basename(process.cwd());
  } catch (error) {
    console.warn('⚠️ Could not fetch app name:', error.message);
    return 'unknown-app';
  }
}

exports.handler = async (options) =>
	new Promise(async (...p) => {
		printArgs(options, 'Build');
		const packageName = getAppName();
		const basePath = `/static/iris/${options.name}/${packageName.split('/')[1]}/`;
		rmSync('dist', {recursive: true, force: true});
		if (options.external) await runExternalBuild(options, { basePath, commitHash });
		console.log('Building 1 ==>', chalk.green(options.name));
		console.log('Using base path 1==> ', chalk.green(basePath));
		const config = setupWebpackBuildConfig(options, { basePath, commitHash });
		const compiler = webpack(config);
		compiler.run(logBuild(p, options));
	});
