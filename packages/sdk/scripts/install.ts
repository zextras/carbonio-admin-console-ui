/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { handler as build } from './build.js';
import { handler as deploy } from './deploy.js';
import chalk from 'chalk';
import { ParsedOptions } from './utils/console.js';

export const desc = 'Build and deploy the project to a Carbonio instance';

export const handler = async (options: ParsedOptions): Promise<void> => {
	await build(options);
	await deploy(options);
	console.log(chalk.bgBlue.white.bold('Install Completed'));
};
