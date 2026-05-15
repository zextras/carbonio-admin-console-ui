/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Plugin } from 'vite';

import { colorLog, getWorkspaceRoot } from './utils';

export function postBuildPlugin(): Plugin {
  return {
    name: 'post-build',
    enforce: 'post',
    async closeBundle() {
      colorLog('\n🔨 Starting post-build tasks...', 'blue');

      const rootDir = getWorkspaceRoot();
      const targetDir = resolve(
        rootDir,
        'dist',
        'opt',
        'zextras',
        'admin',
        'iris',
        'carbonio-admin-ui',
      );

      colorLog(`Target directory: ${targetDir}`, 'cyan');
      mkdirSync(targetDir, { recursive: true });

      const indexHtmlPath = resolve(targetDir, 'index.html');
      const currentDir = resolve(targetDir, 'current');
      mkdirSync(currentDir, { recursive: true });

      if (existsSync(indexHtmlPath)) {
        copyFileSync(indexHtmlPath, resolve(currentDir, 'index.html'));
        colorLog('Copied index.html to current directory', 'green');
      }

      const yapJsonSrc = resolve(rootDir, 'yap.json');
      const yapJsonDest = resolve(rootDir, 'dist', 'yap.json');
      if (existsSync(yapJsonSrc)) {
        copyFileSync(yapJsonSrc, yapJsonDest);
        colorLog('Copied yap.json to dist directory', 'green');
      } else {
        colorLog('yap.json not found, skipping copy', 'orange');
      }

      colorLog('✅ Post-build tasks completed!\n', 'green');
    },
  };
}
