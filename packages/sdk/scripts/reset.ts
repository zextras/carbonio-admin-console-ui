/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'child_process';

import { findWorkspaceRoot, log } from './utils';

export function reset() {
  log('Resetting monorepo... ', 'blue');
  try {
    const rootDir = findWorkspaceRoot();
    // Use the rootDir explicitly for every command
    const execOptions = { stdio: 'inherit' as const, cwd: rootDir };

    log(`Resetting monorepo at: ${rootDir}`, 'blue');

    const steps = [
      { name: 'Cleaning root', command: 'rm -rf node_modules pnpm-lock.yaml .turbo' },
      { name: 'Cleaning apps', command: 'rm -rf apps/**/node_modules apps/**/.turbo' },
      { name: 'Cleaning packages', command: 'rm -rf packages/**/node_modules packages/**/.turbo' },
      { name: 'Pruning store', command: 'pnpm store prune --force' },
      { name: 'Installing', command: 'pnpm install' },
    ];

    for (const step of steps) {
      log(step.name, 'blue');
      execSync(step.command, execOptions);
    }
  } catch (error) {
    log('Reset failed.', 'red');
    process.exit(1);
  }
}
