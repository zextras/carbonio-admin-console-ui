/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const commitHash = require('child_process').execSync('git rev-parse HEAD').toString().trim();

const baseStaticPath = `/static/iris/carbonio-admin-ui/${commitHash}/`;

module.exports = (conf, pkg, options, mode) => {
	const server = `https://${options.host}`;
	const root = 'carbonioAdmin';
	conf.entry = {
		index: path.resolve(process.cwd(), 'src', 'index.tsx')
	};
	conf.output.filename =
		mode === 'development'
			? `source/${commitHash}/zapp-shell.bundle.js`
			: `source/${commitHash}/zapp-admin-ui.bundle.js`;
	conf.resolve.extensions.push('.d.ts');
	conf.plugins.push(
		new CopyPlugin({
			patterns: [
				{
					from: 'assets/',
					to: `source/${commitHash}`
				}
			]
		}),
		new DefinePlugin({
			COMMIT_ID: JSON.stringify(commitHash.toString().trim()),
			BASE_PATH: JSON.stringify(baseStaticPath)
		}),
		new HtmlWebpackPlugin({
			inject: true,
			template: path.resolve(process.cwd(), 'src', 'index.template.html'),
			chunks: [`index`],
			filename: `source/current/index.html`,
			BASE_PATH: baseStaticPath,
			SHELL_ENV: root
		}),
		new HtmlWebpackPlugin({
			inject: false,
			template: path.resolve(process.cwd(), 'commit.template'),
			filename: `source/${commitHash}/commit`,
			COMMIT_ID: commitHash
		})
	);
	conf.devServer = {
		port: 9000,
		historyApiFallback: {
			index: `${baseStaticPath}/index.html`,
			rewrites: [
				{
					from: new RegExp(`/${root}/*`),
					to: `${baseStaticPath}/index.html`
				}
			]
		},
		server: 'https',
		open: [`/${root}/`],
		proxy: [
			{
				context: ['/static/login/**'],
				target: server,
				secure: false,
				cookieDomainRewrite: {
					'*': server,
					[server]: 'localhost:9000'
				}
			},
			{
				context: ['!/static/iris/carbonio-admin-ui/**/*', `!/${root}/`, `!/${root}/**/*`],
				target: server,
				secure: false,
				logLevel: 'debug',
				cookieDomainRewrite: {
					'*': server,
					[server]: 'localhost:9000'
				}
			}
		]
	};
	conf.externals = {};
	conf.module.rules = [
		...conf.module.rules,
		{
			test: /\.(woff(2)?|ttf|eot)$/,
			type: 'asset/resource',
			generator: {
				filename: `./source/${commitHash}/files/[name][ext]`
			}
		}
	];
	return conf;
};
