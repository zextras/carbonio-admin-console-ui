/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const { spawn } = require('node:child_process');
const { resolve } = require('node:path');

exports.command = 'build-shell';
exports.desc = 'Build shell/bootstrap using Vite';
exports.builder = {
	dev: {
		desc: 'Build in development mode',
		alias: 'd',
		default: false,
		boolean: true
	}
};

exports.handler = async (options) => {
	const args = [];
	
	if (options.dev) {
		args.push('--dev');
	}
	
	const scriptPath = resolve(__dirname, 'vite', 'build-shell.mjs');
	
	const buildProcess = spawn('node', [scriptPath, ...args], {
		stdio: 'inherit',
		shell: true,
		cwd: process.cwd()
	});

	buildProcess.on('close', (code) => {
		process.exit(code || 0);
	});
};
