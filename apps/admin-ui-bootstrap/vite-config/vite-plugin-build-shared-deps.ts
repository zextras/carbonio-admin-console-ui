/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { build as esbuild } from 'esbuild';
import { build as viteBuild, type Plugin, type ResolvedConfig } from 'vite';

import { getCommitHash, getWorkspaceRoot } from '../../../scripts/utils';
import { DepConfig, sharedDepsConfig } from './shared-deps-config';
import { REACT_DOM_EXPORTS, REACT_EXPORTS } from './shared-deps-constants';

interface BuildSharedDepsPluginOptions {
  isDev?: boolean;
}

export function buildSharedDepsPlugin(options: BuildSharedDepsPluginOptions = {}): Plugin {
  let config: ResolvedConfig;
  const { isDev = false } = options;

  return {
    name: 'build-shared-deps',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async closeBundle() {
      const rootDir = getWorkspaceRoot();
      const commitHash = getCommitHash();
      const nodeModulesDir = join(rootDir, 'node_modules');
      const sharedDepsParentDir = join(rootDir, 'dist/opt/zextras/admin/iris/shared-dependencies');
      const outputDir = join(sharedDepsParentDir, commitHash);

      if (existsSync(sharedDepsParentDir)) {
        rmSync(sharedDepsParentDir, { recursive: true, force: true });
      }
      mkdirSync(outputDir, { recursive: true });

      config.logger.info(`Building shared dependencies to: ${outputDir}`);

      const depConfig = sharedDepsConfig(nodeModulesDir, isDev);

      const buildPromises = depConfig.map(async (dep) => {
        config.logger.info(`Building ${dep.name}...`);
        try {
          if (dep.type === 'wrap-cjs') {
            await buildWrappedCJS(dep, outputDir, isDev);
          } else if (dep.type === 'build-vite') {
            await buildWithVite(dep, outputDir, isDev, nodeModulesDir);
          }

          config.logger.info(`  ✓ Built ${dep.name}`);
        } catch (error) {
          config.logger.error(`  ✗ Failed to build ${dep.name}`);
          throw error;
        }
      });

      await Promise.all(buildPromises);
      config.logger.info('✅ Shared dependencies build completed!');
    },
  };
}

async function buildWrappedCJS(dep: DepConfig, outputDir: string, isDev: boolean) {
  const exportsList = dep.name === 'react' ? REACT_EXPORTS : REACT_DOM_EXPORTS;

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
