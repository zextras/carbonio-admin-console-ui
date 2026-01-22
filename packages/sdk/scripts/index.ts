#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { pkg } from './utils/pkg.js';
import { ParsedOptions } from './utils/console.js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

type CommandHandler = {
	handler: (options: ParsedOptions) => Promise<void>;
	desc?: string;
};

type ParseArgsResult = {
	command?: string;
	options: ParsedOptions;
};

const parseArgs = (): ParseArgsResult => {
	const args = process.argv.slice(2);
	const options: ParsedOptions = {
		verbose: false,
		admin: pkg.carbonio?.type === 'carbonioAdmin',
		name: pkg.carbonio?.name ?? '',
		svgr: pkg.sdk?.svgr ?? false,
	};

	const flags: Record<string, Array<string>> = {
		verbose: ['-v', '--verbose'],
		admin: ['-a', '--admin'],
		name: ['-n', '--name'],
		svgr: ['--svgr'],
		host: ['-h', '--host'],
		user: ['-u', '--user'],
		port: ['-p', '--port'],
		dev: ['-d', '--dev'],
		pkgRel: ['--pkgRel'],
	};

	let i = 0;
	while (i < args.length) {
		const arg = args[i];
		const found = Object.entries(flags).find(([_, aliases]) => aliases.includes(arg));

		if (found) {
			const [key] = found;
			if (key === 'verbose' || key === 'admin' || key === 'svgr' || key === 'dev') {
				options[key] = true;
			} else if (args[i + 1] && !args[i + 1].startsWith('-')) {
				options[key] = args[i + 1];
				i++;
			}
		}
		i++;
	}

	const command = args.find((arg: string) => !arg.startsWith('-'));

	return { command, options };
};

const { command, options } = parseArgs();

const commands: Record<string, () => Promise<CommandHandler>> = {
	build: () => import('./build.js'),
	'build-shell': () => import('./build-shell.js'),
	deploy: () => import('./deploy.js'),
	install: () => import('./install.js'),
};

if (!command || !commands[command]) {
	console.error('Usage: npx sdk <command> [options]\n');
	console.error('Commands:');
	const commandEntries = await Promise.all(
		Object.entries(commands).map(async ([name, importFn]) => {
			const mod = await importFn();
			return [name, mod.desc || ''] as [string, string];
		}),
	);
	commandEntries.forEach(([name, desc]) => {
		console.error(`  ${name.padEnd(12)} ${desc}`);
	});
	console.error('\nOptions:');
	console.error('  -v, --verbose   Verbose logging');
	console.error('  -h, --host     Destination hostname');
	console.error('  -u, --user     Username for ssh access (default: root)');
	console.error('  -p, --port     Port number');
	console.error('  -d, --dev      Development mode');
	console.error('  --pkgRel       Package release number');
	console.error('  -n, --name     Alternative package name');
	process.exit(1);
}

const mod = await commands[command ?? 'build']();
mod.handler(options).catch((err: Error) => {
	console.error(err);
	process.exit(1);
});
