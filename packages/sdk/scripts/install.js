/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const { handler: build } = require('./build');
const { handler: deploy } = require('./deploy');
const chalkTemplate = require('chalk');

exports.desc = 'Build and deploy the project to a Carbonio instance';

exports.handler = async (options) => {
	await build(options);
	await deploy(options);
	console.log(chalkTemplate.bgBlue.white.bold('Install Completed'));
};
