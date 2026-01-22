/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const desc = 'Build shell/bootstrap using Vite';

export const handler = async (options) => {
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
