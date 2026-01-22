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

// Build runtime shell with Vite
console.log('\nBuilding runtime shell...');
await build({
  configFile: path.resolve(cwd, 'vite.config.ts'),
  mode,
});

// Build library exports separately
console.log('\nBuilding library exports...');
await build({
  configFile: path.resolve(cwd, 'vite.config.ts'),
  mode,
  build: {
    outDir: path.resolve(cwd, 'dist', 'source', commitHash),
    emptyOutDir: false, // Don't delete the runtime shell
    lib: {
      entry: path.resolve(cwd, 'exports.ts'),
      name: 'CarbonioAdminUIBootstrap',
      fileName: (format) => `bootstrap-exports.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es'],
    },
    sourcemap: isDev,
    rollupOptions: {
      // NOTE: Do NOT externalize @tanstack/react-query here!
      // The bootstrap-exports must bundle react-query so that sub-apps
      // using hooks like useLicenseInfo share the same QueryClient context
      // with the shell's ReactQueryProvider.
      // NOTE: zustand must be externalized to share the same store instance
      // between shell.mjs and bootstrap-exports.mjs
      external: ['react', 'react-dom', 'lodash-es', 'styled-components', 'i18next', 'zustand'],
      output: {
        entryFileNames: isDev ? 'bootstrap-exports.mjs' : `bootstrap-exports.[hash].mjs`,
      },
    },
  },
});

// Build shared dependencies (for offline support) - must be after Vite build
console.log('\nBuilding shared dependencies...');
const { buildSharedDeps } = await import('./build-shared-deps.mjs');
await buildSharedDeps(commitHash);

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

  // Inject import map BEFORE the shell script tag (handles both shell.mjs and shell.[hash].mjs)
  indexHtml = indexHtml.replace(
    /(<script type="module"[^>]*shell(?:\.[^"']+)?\.mjs")/,
    `${importMapScript}\n  $1`,
  );

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

// Determine the library exports file name
let exportsFileName;
try {
  const distFiles = fs.readdirSync(distDir);
  const exportsFiles = distFiles.filter(
    (f) => f.startsWith('bootstrap-exports.') && f.endsWith('.mjs'),
  );
  if (exportsFiles.length > 0) {
    // Prefer hashed filenames
    const hashedFiles = exportsFiles.filter((f) => f !== 'bootstrap-exports.mjs');
    exportsFileName = hashedFiles.length > 0 ? hashedFiles[0] : exportsFiles[0];
  }
} catch {
  // Fallback to default naming
  exportsFileName = isDev
    ? 'bootstrap-exports.mjs'
    : `bootstrap-exports.${commitHash.substring(0, 8)}.mjs`;
}

// Use different bundle names for dev vs production (ESM uses .mjs)
const bundleName = exportsFileName;

const componentJson = {
  name: 'carbonio-admin-ui',
  js_entrypoint: `/static/iris/carbonio-admin-ui/${commitHash}/${bundleName}`,
  description: packageJson.description || '',
  version: packageJson.version,
  commit: commitHash,
  priority: -1,
  type: 'shell',
  icon: 'CubeOutline',
  display: 'Admin Shell',
};

fs.writeFileSync(
  path.resolve(distDir, 'component.json'),
  JSON.stringify(componentJson, null, '\t'),
);
console.log('Generated component.json');

console.log(`\nBuild completed successfully!`);
console.log(`Output directory: ${distDir}`);
