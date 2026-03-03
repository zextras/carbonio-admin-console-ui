/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Plugin } from 'vite';

import { colorLog, generateImportMap, getWorkspaceRoot } from './utils';

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

      const importMap = generateImportMap();
      colorLog('Generated import map object', 'green');

      const indexHtmlPath = resolve(targetDir, 'index.html');

      if (existsSync(indexHtmlPath)) {
        const originalIndexHtml = readFileSync(indexHtmlPath, 'utf8');
        const importMapScript = `<script type="importmap">${JSON.stringify(
          importMap,
          null,
          2,
        )}</script>`;
        const updatedIndexHtml = originalIndexHtml.replace(
          /(<script type="module"[^>]*shell(?:\.[^"']+)?\.mjs")/,
          `${importMapScript}\n  $1`,
        );
        writeFileSync(indexHtmlPath, updatedIndexHtml);
        colorLog('Injected import map into index.html', 'green');
      }

      const currentDir = resolve(targetDir, 'current');
      mkdirSync(currentDir, { recursive: true });

      if (existsSync(indexHtmlPath)) {
        copyFileSync(indexHtmlPath, resolve(currentDir, 'index.html'));
        colorLog('Copied index.html to current directory', 'green');
      }

      colorLog('✅ Post-build tasks completed!\n', 'green');
    },
  };
}
