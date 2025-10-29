/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const { spawn } = require('node:child_process');
const { resolve } = require('node:path');

exports.command = 'build-shell';
exports.desc = 'Build shell/bootstrap using Vite';
exports.builder = {};

exports.handler = async (options) => {
	const scriptPath = resolve(__dirname, 'vite', 'build-shell.mjs');
	
	const buildProcess = spawn('node', [scriptPath], {
		stdio: 'inherit',
		shell: true,
		cwd: process.cwd()
	});

	buildProcess.on('close', (code) => {
		process.exit(code || 0);
	});
};
