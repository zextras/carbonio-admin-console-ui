/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const { spawn } = require('node:child_process');
const { resolve } = require('node:path');

exports.command = 'vite-build';
exports.desc = 'Build project using Vite';
exports.builder = {
	dev: {
		desc: 'Build in development mode',
		alias: 'd',
		default: false,
		boolean: true
	},
	pkgRel: {
		desc: 'Package release number',
		default: '1'
	}
};

exports.handler = async (options) => {
	const args = [];
	
	if (options.dev) {
		args.push('--dev');
	}
	
	if (options.pkgRel) {
		args.push(`--pkgRel=${options.pkgRel}`);
	}

	const scriptPath = resolve(__dirname, 'vite', 'build.mjs');
	
	const buildProcess = spawn('node', [scriptPath, ...args], {
		stdio: 'inherit',
		shell: true,
		cwd: process.cwd()
	});

	buildProcess.on('close', (code) => {
		process.exit(code || 0);
	});
};
