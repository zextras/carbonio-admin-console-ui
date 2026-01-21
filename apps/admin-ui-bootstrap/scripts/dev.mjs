#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { spawn } from 'child_process';

const args = process.argv.slice(2);
const target = args.find((arg) => !arg.startsWith('-')) || 'localhost';

const vite = spawn('vite', {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env, VITE_TARGET: target },
});

vite.on('exit', (code) => {
  process.exit(code ?? 1);
});
