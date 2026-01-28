/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Plugin, ResolvedConfig } from 'vite';

import { generateImportMap } from './generate-import-map';
import { copyRecursive, getCommitHash, getWorkspaceRoot } from './utils';

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
      const cwd = process.cwd();

      const distDir = resolve(cwd, 'dist', 'source', commitHash);
      const currentDir = resolve(cwd, 'dist', 'source', 'current');

      if (!existsSync(currentDir)) {
        mkdirSync(currentDir, { recursive: true });
      }

      config.logger.info('Generating import map...');
      const importMap = generateImportMap(commitHash);

      const importMapPath = resolve(distDir, 'import-map.json');
      writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
      config.logger.info('Generated import-map.json');

      const indexHtmlPath = resolve(distDir, 'index.html');
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
        config.logger.info('Injected import map into index.html');
      }

      const commitFilePath = resolve(distDir, 'commit');
      writeFileSync(commitFilePath, commitHash);
      config.logger.info('Generated commit file');

      config.logger.info('Copying built files to package directory...');
      const packageDir = resolve(
        rootDir,
        'package',
        'opt',
        'zextras',
        'admin',
        'iris',
        'carbonio-admin-ui',
      );
      const packageCommitDir = resolve(packageDir, commitHash);
      const packageCurrentDir = resolve(packageDir, 'current');

      if (existsSync(packageDir)) {
        rmSync(packageDir, { recursive: true, force: true });
        config.logger.info(`Cleaned ${packageDir}`);
      }

      mkdirSync(packageCommitDir, { recursive: true });
      mkdirSync(packageCurrentDir, { recursive: true });

      copyRecursive(distDir, packageCommitDir);
      config.logger.info(`Copied to ${packageCommitDir}`);

      const distIndexHtmlPath = resolve(distDir, 'index.html');
      if (existsSync(distIndexHtmlPath)) {
        writeFileSync(
          resolve(packageCurrentDir, 'index.html'),
          readFileSync(distIndexHtmlPath, 'utf8'),
        );
        config.logger.info(`Copied index.html to ${packageCurrentDir}`);
      }

      config.logger.info(`Build completed successfully!`);
      config.logger.info(`Output directory: ${distDir}`);
      config.logger.info(`Package directory: ${packageDir}`);
    },
  };
}
