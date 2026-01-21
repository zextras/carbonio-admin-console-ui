#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type ChildProcess,spawn } from 'child_process';

const args: Array<string> = process.argv.slice(2);
const target: string = args.find((arg) => !arg.startsWith('-')) || 'localhost';

const vite: ChildProcess = spawn('vite', {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env, VITE_TARGET: target },
});

vite.on('exit', (code: number | null) => {
  process.exit(code ?? 1);
});
