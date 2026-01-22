/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

type BuildOptions = {
  dev?: boolean;
  [key: string]: string | boolean | undefined;
};

export const buildShell = async (options: BuildOptions): Promise<void> => {
  const args: Array<string> = [];

  if (options.dev) {
    args.push('--dev');
  }

  const scriptPath = resolve(__dirname, 'vite', 'build-shell.mjs');

  const buildProcess = spawn('node', [scriptPath, ...args], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
  });

  buildProcess.on('close', (code: number | null) => {
    process.exit(code ?? 0);
  });
};
