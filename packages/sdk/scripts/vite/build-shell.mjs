#!/usr/bin/env node
/* eslint-disable no-console */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { build } from 'vite';

const cwd = process.cwd();
const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();

const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const mode = isDev ? 'development' : 'production';

console.log(`Building shell in ${mode} mode`);
console.log(`Commit hash: ${commitHash}`);

// Clean dist directory
const distPath = path.resolve(cwd, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('Cleaned dist directory');
}

// Build with Vite
await build({
  configFile: path.resolve(cwd, 'vite.config.ts'),
  mode,
});

console.log('\nRunning post-build tasks...');

const distDir = path.resolve(cwd, 'dist', 'source', commitHash);
const currentDir = path.resolve(cwd, 'dist', 'source', 'current');

// Create current directory
if (!fs.existsSync(currentDir)) {
  fs.mkdirSync(currentDir, { recursive: true });
}

// Generate import map
console.log('Generating import map...');
const { generateImportMap } = await import('./generate-import-map.mjs');
const importMap = generateImportMap(commitHash);

// Write import map to dist
const importMapPath = path.resolve(distDir, 'import-map.json');
fs.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
console.log('Generated import-map.json');

// Inject import map into index.html (both dist and current/)
const indexHtmlPath = path.resolve(distDir, 'index.html');
const indexHtmlCurrentDest = path.resolve(currentDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  const importMapScript = `<script type="importmap">${JSON.stringify(importMap, null, 2)}</script>`;

  // Inject import map BEFORE the shell.mjs script tag
  indexHtml = indexHtml.replace(/(<script type="module"[^>]*shell\.mjs")/, `${importMapScript}\n  $1`);

  // Write to both dist and current directories
  fs.writeFileSync(indexHtmlPath, indexHtml);
  fs.writeFileSync(indexHtmlCurrentDest, indexHtml);
  console.log('Injected import map into index.html');
}

// Generate commit file
const commitFilePath = path.resolve(distDir, 'commit');
fs.writeFileSync(commitFilePath, commitHash);
console.log('Generated commit file');

// Generate component.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(cwd, 'package.json'), 'utf-8'));

// Use different bundle names for dev vs production (ESM uses .mjs)
const bundleName = isDev ? 'shell.mjs' : `shell.${commitHash.substring(0, 8)}.mjs`;

const componentJson = {
  name: 'carbonio-admin-ui',
  js_entrypoint: `/static/iris/carbonio-admin-ui/${commitHash}/${bundleName}`,
  description: packageJson.description || '',
  version: packageJson.version,
  commit: commitHash,
  priority: -1,
  type: 'shell',
  attrKey: '',
  icon: 'CubeOutline',
  display: 'Admin Shell',
  sentryDsn: '',
};

fs.writeFileSync(
  path.resolve(distDir, 'component.json'),
  JSON.stringify(componentJson, null, '\t'),
);
console.log('Generated component.json');

console.log(`\nBuild completed successfully!`);
console.log(`Output directory: ${distDir}`);
