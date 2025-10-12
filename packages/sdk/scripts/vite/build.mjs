#!/usr/bin/env node

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// The project root is the current working directory where the script is called from
const projectRoot = process.cwd();

const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const pkgRel =
	args.find((arg) => arg.startsWith('--pkgRel='))?.split('=')[1] ||
	process.env.PKG_REL ||
	(isDev ? Math.floor(Date.now() / 1000).toString() : '1');

const env = {
	...process.env,
	PKG_REL: pkgRel,
	NODE_ENV: isDev ? 'development' : 'production'
};

console.log(`Building in ${isDev ? 'development' : 'production'} mode`);
console.log(`Package release: ${pkgRel}`);

const vite = spawn('vite', ['build', ...(isDev ? ['--mode', 'development'] : [])], {
	cwd: projectRoot,
	env,
	stdio: 'inherit',
	shell: true
});

vite.on('close', (code) => {
	if (code !== 0) {
		console.error(`Vite build failed with code ${code}`);
		process.exit(code || 1);
	}

	console.log('\nRunning post-build tasks...');

	const postbuild = spawn('node', [join(__dirname, 'postbuild.mjs')], {
		cwd: projectRoot,
		env,
		stdio: 'inherit',
		shell: true
	});

	postbuild.on('close', (code) => {
		if (code !== 0) {
			console.error(`Post-build failed with code ${code}`);
			process.exit(code || 1);
		}
		console.log('\nBuild completed successfully!');
	});
});
