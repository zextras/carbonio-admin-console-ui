/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Plugin, ResolvedConfig } from 'vite';

import { colorLog, getCommitHash, getWorkspaceRoot } from '../../../scripts/utils';
import { generateImportMap } from './generate-import-map';

export function postBuildPlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'post-build',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async closeBundle() {
      const rootDir = getWorkspaceRoot();
      const commitHash = getCommitHash();
      const targetDir = resolve(
        rootDir,
        'dist',
        'opt',
        'zextras',
        'admin',
        'iris',
        'carbonio-admin-ui',
      );

      const commitHashDir = resolve(targetDir, commitHash);
      const currentDir = resolve(targetDir, 'current');
      mkdirSync(currentDir, { recursive: true });

      const importMap = generateImportMap(commitHash);
      colorLog('Generated import map object', 'green');

      const indexHtmlPath = resolve(commitHashDir, 'index.html');

      const indexHtmlCurrentDest = resolve(currentDir, 'index.html');

      if (existsSync(indexHtmlPath)) {
        let indexHtml = readFileSync(indexHtmlPath, 'utf8');
        const importMapScript = `<script type="importmap">${JSON.stringify(
          importMap,
          null,
          2,
        )}</script>`;

        indexHtml = indexHtml.replace(
          /(<script type="module"[^>]*shell(?:\.[^"']+)?\.mjs")/,
          `${importMapScript}\n  $1`,
        );

        writeFileSync(indexHtmlPath, indexHtml);
        writeFileSync(indexHtmlCurrentDest, indexHtml);
        colorLog('Injected import map into index.html', 'green');
      }

      const commitFilePath = resolve(commitHashDir, 'commit');
      writeFileSync(commitFilePath, commitHash);
      colorLog('Generated commit file', 'green');
    },
  };
}
