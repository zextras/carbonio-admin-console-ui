/* eslint-disable no-console */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { build } from 'vite';

import { buildSharedDeps } from './build-shared-deps/build-shared-deps';
import { generateImportMap } from './generate-import-map';
import { copyRecursive, getWorkspaceRoot } from './utils';

async function buildShell(): Promise<void> {
  const args = process.argv.slice(2);

  const cwd = process.cwd();
  const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();

  const isDev = args.includes('--dev');
  const mode = isDev ? 'development' : 'production';

  console.log(`Building shell in ${mode} mode`);
  console.log(`Commit hash: ${commitHash}`);

  // Clean dist directory
  const distPath = path.resolve(cwd, 'dist');
  if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true, force: true });
    console.log('Cleaned dist directory');
  }

  // Build runtime shell with Vite
  console.log('\nBuilding runtime shell...');
  await build({
    configFile: path.resolve(cwd, 'vite.config.ts'),
    mode,
  });

  // Build library exports separately
  console.log('\nBuilding shared dependencies...');
  await buildSharedDeps(commitHash, isDev);

  console.log('\nRunning post-build tasks...');
  const distDir = path.resolve(cwd, 'dist', 'source', commitHash);
  const currentDir = path.resolve(cwd, 'dist', 'source', 'current');

  // Create current directory
  if (!existsSync(currentDir)) {
    mkdirSync(currentDir, { recursive: true });
  }

  // Generate import map
  console.log('Generating import map...');
  const importMap = generateImportMap(commitHash);

  // Write import map to dist
  const importMapPath = path.resolve(distDir, 'import-map.json');
  writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
  console.log('Generated import-map.json');

  // Inject import map into index.html (both dist and current/)
  const indexHtmlPath = path.resolve(distDir, 'index.html');
  const indexHtmlCurrentDest = path.resolve(currentDir, 'index.html');
  if (existsSync(indexHtmlPath)) {
    let indexHtml = readFileSync(indexHtmlPath, 'utf-8');
    const importMapScript = `<script type="importmap">${JSON.stringify(
      importMap,
      null,
      2,
    )}</script>`;

    // Inject import map BEFORE the shell script tag (handles both shell.mjs and shell.[hash].mjs)
    indexHtml = indexHtml.replace(
      /(<script type="module"[^>]*shell(?:\.[^"']+)?\.mjs")/,
      `${importMapScript}\n  $1`,
    );

    // Write to both dist and current directories
    writeFileSync(indexHtmlPath, indexHtml);
    writeFileSync(indexHtmlCurrentDest, indexHtml);
    console.log('Injected import map into index.html');
  }

  // Generate commit file
  const commitFilePath = path.resolve(distDir, 'commit');
  writeFileSync(commitFilePath, commitHash);
  console.log('Generated commit file');

  // Copy built files to package directory
  console.log('\nCopying built files to package directory...');
  const rootDir = getWorkspaceRoot();
  const packageDir = path.resolve(
    rootDir,
    'package',
    'opt',
    'zextras',
    'admin',
    'iris',
    'carbonio-admin-ui',
  );
  const packageCommitDir = path.resolve(packageDir, commitHash);
  const packageCurrentDir = path.resolve(packageDir, 'current');

  // Clean package directory before writing
  if (existsSync(packageDir)) {
    rmSync(packageDir, { recursive: true, force: true });
    console.log(`Cleaned ${packageDir}`);
  }

  // Ensure package directories exist
  mkdirSync(packageCommitDir, { recursive: true });
  mkdirSync(packageCurrentDir, { recursive: true });

  // Copy all files to commit-specific directory
  copyRecursive(distDir, packageCommitDir);
  console.log(`Copied to ${packageCommitDir}`);

  // Copy only index.html to current directory
  const distIndexHtmlPath = path.resolve(distDir, 'index.html');
  if (existsSync(distIndexHtmlPath)) {
    writeFileSync(
      path.resolve(packageCurrentDir, 'index.html'),
      readFileSync(distIndexHtmlPath, 'utf-8'),
    );
    console.log(`Copied index.html to ${packageCurrentDir}`);
  }

  console.log(`\nBuild completed successfully!`);
  console.log(`Output directory: ${distDir}`);
  console.log(`Package directory: ${packageDir}`);
}

buildShell();
