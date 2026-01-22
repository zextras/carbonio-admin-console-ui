#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const { pkg } = require('./utils/pkg');

const parseArgs = () => {
	const args = process.argv.slice(2);
	const options = {
		verbose: false,
		admin: pkg.carbonio?.type === 'carbonioAdmin',
		name: pkg.carbonio?.name,
		svgr: pkg.sdk?.svgr ?? false
	};

	const flags = {
		verbose: ['-v', '--verbose'],
		admin: ['-a', '--admin'],
		name: ['-n', '--name'],
		svgr: ['--svgr'],
		host: ['-h', '--host'],
		user: ['-u', '--user'],
		port: ['-p', '--port'],
		dev: ['-d', '--dev'],
		pkgRel: ['--pkgRel']
	};

	let i = 0;
	while (i < args.length) {
		const arg = args[i];
		const found = Object.entries(flags).find(([_, aliases]) => aliases.includes(arg));

		if (found) {
			const [key, aliases] = found;
			if (key === 'verbose' || key === 'admin' || key === 'svgr' || key === 'dev') {
				options[key] = true;
			} else if (args[i + 1] && !args[i + 1].startsWith('-')) {
				options[key] = args[i + 1];
				i++;
			}
		}
		i++;
	}

	const command = args.find(arg => !arg.startsWith('-'));

	return { command, options };
};

const { command, options } = parseArgs();

const commands = {
	build: require('./build'),
	'build-shell': require('./build-shell'),
	deploy: require('./deploy'),
	install: require('./install')
};

if (!command || !commands[command]) {
	console.error('Usage: npx sdk <command> [options]\n');
	console.error('Commands:');
	Object.entries(commands).forEach(([name, cmd]) => {
		console.error(`  ${name.padEnd(12)} ${cmd.desc}`);
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

commands[command].handler(options).catch(err => {
	console.error(err);
	process.exit(1);
});
