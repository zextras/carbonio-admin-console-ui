/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import chalk from 'chalk';

export type ParsedOptions = {
	verbose: boolean;
	admin: boolean;
	name: string;
	svgr: boolean;
	host?: string;
	user?: string;
	port?: string;
	dev?: boolean;
	pkgRel?: string;
	[key: string]: string | boolean | undefined;
};

type BuildError = {
	message: string;
	moduleName?: string;
	file?: string;
	loc?: string;
	details?: string;
	stack?: string;
};

type BuildStats = {
	toJson: () => { warnings?: Array<BuildError>; errors?: Array<BuildError> };
	hasWarnings: () => boolean;
	hasErrors: () => boolean;
};

type LogBuildResolveReject = [(stats?: BuildStats) => void, (err?: Error | null) => void];

export const printArgs = (opts: ParsedOptions, label: string): ParsedOptions => {
	if (opts.verbose) {
		const options = Object.entries(opts);
		console.log(chalk.green.bold(`${label} options:`));
		options.forEach(opt => {
			console.log(`- ${chalk.green.bold(opt[0])}: ${opt[1]}`);
		});
	}
	return opts;
};

const logErrors = (errors: Array<BuildError>, gravity: 'error' | 'warning', verbose: boolean): void => {
	const title = gravity === 'error' ? chalk.bgRed.white : chalk.bgYellow.white;
	const message = gravity === 'error' ? chalk.redBright : chalk.yellowBright;
	errors.forEach((error, i) => {
		console.log(title(`${i + 1}/${errors.length}:`));
		console.log(message(` > ${error.message}`));
		if (error.moduleName) console.log(message('Module: '), error.moduleName);
		if (error.file) console.log(message('File: '), error.file, error.loc ? ` at position ${error.loc}` : '');
		if (error.details) console.log(message('Details: '), error.details);
		if (error.stack && verbose) console.log(message('Stack: '), error.stack);
	});
};

export const logBuild =
	([resolve, reject]: LogBuildResolveReject, options: ParsedOptions) =>
	(err: Error | null, stats?: BuildStats): void => {
		if (err) {
			console.log(chalk.bgRed.white.bold('Webpack Runtime Error'));
			logErrors([err], 'error', !!options.verbose);
			if (reject) reject(err || undefined);
		}

		if (!stats) return;

		const info = stats.toJson();

		if (stats.hasWarnings()) {
			console.log(chalk.bgYellow.white.bold(`Webpack Compilation Warning${info.warnings && info.warnings.length > 1 ? 's' : ''}`));
			if (info.warnings) logErrors(info.warnings, 'warning', !!options.verbose);
		}

		if (stats.hasErrors()) {
			console.log(
				chalk.bgRed.white.bold(`Webpack Compilation Error${info.errors && info.errors.length > 1 ? 's' : ''}`)
			);
			if (info.errors) logErrors(info.errors, 'error', !!options.verbose);
			if (reject) reject(err);
		} else {
			console.log(chalk.bgBlue.white.bold('Compiled Successfully!'));
		}
		if (resolve) resolve(stats);
	};
