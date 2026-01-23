/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { build as esbuild } from 'esbuild';
import { build as viteBuild } from 'vite';

import { findWorkspaceRoot, log } from '../utils';
import { REACT_DOM_EXPORTS, REACT_EXPORTS } from './constants';
import { DepConfig, sharedDepsConfig } from './shared-deps-config';

const rootDir = findWorkspaceRoot();
const nodeModulesDir = join(rootDir, 'node_modules');

export async function buildSharedDeps(commitHash: string) {
  const sharedDepsParentDir = join(rootDir, 'package/opt/zextras/admin/iris/shared-dependencies');
  const outputDir = join(sharedDepsParentDir, commitHash);

  // Setup directories
  if (existsSync(sharedDepsParentDir)) {
    rmSync(sharedDepsParentDir, { recursive: true, force: true });
  }
  mkdirSync(outputDir, { recursive: true });

  log(`Building shared dependencies to: ${outputDir}`);

  // Run builds in parallel
  const buildPromises = sharedDepsConfig.map(async (dep) => {
    log(`Building ${dep.name}...`);
    try {
      if (dep.type === 'copy') {
        // Implementation for copy if needed (not currently used in config but good to keep)
        // copyFileSync(dep.entry, join(outputDir, dep.outputName));
        return;
      }

      if (dep.type === 'wrap-cjs') {
        await buildWrappedCJS(dep, outputDir);
      } else if (dep.type === 'build-vite') {
        await buildWithVite(dep, outputDir);
      }

      log(`  ✓ Built ${dep.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to build ${dep.name}`);
      throw error;
    }
  });

  await Promise.all(buildPromises);
  log('✅ Shared dependencies build completed!', 'green');
}

/**
 * Handles CJS modules (React/ReactDOM) by creating a virtual entry point
 * that re-exports named exports explicitly.
 */
async function buildWrappedCJS(dep: DepConfig, outputDir: string) {
  const exportsList = dep.name === 'react' ? REACT_EXPORTS : REACT_DOM_EXPORTS;

  // Create a virtual entry file content
  // This imports the CJS file and manually exports the named members
  // esbuild handles the CJS interop automatically here.
  const virtualEntry = `
    import Lib from '${dep.entry.replace(/\\/g, '/')}';
    export default Lib;
    export const { ${exportsList.join(', ')} } = Lib;
  `;

  await esbuild({
    stdin: {
      contents: virtualEntry,
      resolveDir: dirname(dep.entry),
      sourcefile: 'virtual-entry.js',
      loader: 'js',
    },
    bundle: true,
    format: 'esm',
    outfile: join(outputDir, dep.outputName),
    target: 'esnext',
    minify: false, // Keep false if you need to debug named exports, otherwise true is fine
    platform: 'browser',
    external: dep.external || [],
  });
}

/**
 * Handles standard ESM builds using Vite (Rollup)
 */
async function buildWithVite(dep: DepConfig, outputDir: string) {
  const outputBaseName = dep.outputName.replace(/\.mjs$/, '');

  await viteBuild({
    configFile: false,
    mode: 'production',
    logLevel: 'silent', // Reduce noise during parallel builds
    build: {
      lib: {
        entry: dep.entry,
        name: dep.name,
        fileName: () => outputBaseName,
        formats: ['es'],
      },
      outDir: outputDir,
      emptyOutDir: false,
      sourcemap: false,
      rollupOptions: {
        external: dep.external || [],
        output: {
          entryFileNames: `${outputBaseName}.mjs`,
        },
      },
      target: 'esnext',
      minify: true,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    resolve: {
      alias: {
        'react-dom': resolve(nodeModulesDir, 'react-dom'),
      },
    },
  });
}
