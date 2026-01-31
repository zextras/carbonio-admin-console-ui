/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { init, parse } from 'cjs-module-lexer';
import { build as esbuild } from 'esbuild';
import { build as viteBuild, type Plugin } from 'vite';

import { colorLog, getWorkspaceRoot } from '../../../scripts/utils';
import { DepConfig, getSharedDepsConfig } from './utils';

/**
 * Automatically detects named exports from a CJS module using cjs-module-lexer.
 * This is the same approach Node.js uses internally for CJS-to-ESM interop.
 */
async function detectCjsExports(entryPath: string): Promise<string[]> {
  const code = readFileSync(entryPath, 'utf-8');
  const { exports } = parse(code);
  return exports;
}

export function buildSharedDepsPlugin({ isDev }: { isDev: boolean }): Plugin {
  return {
    name: 'build-shared-deps',
    enforce: 'post',
    async closeBundle() {
      colorLog('\n📦 Starting shared dependencies build...', 'blue');

      // Initialize cjs-module-lexer once before processing any CJS deps
      await init();

      const rootDir = getWorkspaceRoot();
      const nodeModulesDir = join(rootDir, 'node_modules');
      const outputDir = join(rootDir, 'dist/opt/zextras/admin/iris/shared-dependencies');

      if (existsSync(outputDir)) {
        rmSync(outputDir, { recursive: true, force: true });
      }
      mkdirSync(outputDir, { recursive: true });

      const depConfig = getSharedDepsConfig(nodeModulesDir, isDev);

      const buildPromises = depConfig.map(async (dep) => {
        try {
          if (dep.type === 'wrap-cjs') {
            await buildWrappedCJS(dep, outputDir, isDev);
          } else if (dep.type === 'build-vite') {
            await buildWithVite(dep, outputDir, isDev, nodeModulesDir);
          }

          colorLog(`  ✓ Built ${dep.name}`, 'green');
        } catch (error) {
          colorLog(`  ✗ Failed to build ${dep.name}`, 'red');
          throw error;
        }
      });

      await Promise.all(buildPromises);
      colorLog('✅ Shared dependencies build completed!\n', 'green');
    },
  };
}

async function buildWrappedCJS(dep: DepConfig, outputDir: string, isDev: boolean) {
  const exportsList = await detectCjsExports(dep.entry);

  if (exportsList.length === 0) {
    throw new Error(`No exports detected for ${dep.name} at ${dep.entry}`);
  }

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
    minify: !isDev,
    platform: 'browser',
    external: dep.external || [],
    define: {
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    },
  });
}

async function buildWithVite(
  dep: DepConfig,
  outputDir: string,
  isDev: boolean,
  nodeModulesDir: string,
) {
  const outputBaseName = dep.outputName.replace(/\.mjs$/, '');

  await viteBuild({
    configFile: false,
    mode: isDev ? 'development' : 'production',
    logLevel: 'silent',
    build: {
      lib: {
        entry: dep.entry,
        name: dep.name,
        fileName: () => outputBaseName,
        formats: ['es'],
      },
      outDir: outputDir,
      emptyOutDir: false,
      sourcemap: isDev,
      rollupOptions: {
        external: dep.external || [],
        output: {
          entryFileNames: `${outputBaseName}.mjs`,
        },
      },
      target: 'esnext',
      minify: !isDev,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    },
    resolve: {
      alias: {
        'react-dom': resolve(nodeModulesDir, 'react-dom'),
      },
    },
  });
}
