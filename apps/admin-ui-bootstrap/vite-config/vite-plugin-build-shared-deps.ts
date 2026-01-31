/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { build as esbuild } from 'esbuild';
import { build as viteBuild, type Plugin, type ResolvedConfig } from 'vite';

import { colorLog, getWorkspaceRoot } from '../../../scripts/utils';
import { DepConfig, getSharedDepsConfig } from './utils';

const REACT_EXPORTS = [
  'Children',
  'Component',
  'Fragment',
  'Profiler',
  'PureComponent',
  'StrictMode',
  'Suspense',
  '__COMPILER_RUNTIME',
  'cache',
  'cacheSignal',
  'cloneElement',
  'createContext',
  'createElement',
  'createRef',
  'forwardRef',
  'isValidElement',
  'lazy',
  'memo',
  'startTransition',
  'unstable_useCacheRefresh',
  'use',
  'useActionState',
  'useCallback',
  'useContext',
  'useDebugValue',
  'useDeferredValue',
  'useEffect',
  'useEffectEvent',
  'useId',
  'useImperativeHandle',
  'useInsertionEffect',
  'useLayoutEffect',
  'useMemo',
  'useOptimistic',
  'useReducer',
  'useRef',
  'useState',
  'useSyncExternalStore',
  'useTransition',
  'version',
] as const;

const REACT_DOM_EXPORTS = [
  'createPortal',
  'findDOMNode',
  'flushSync',
  'hydrate',
  'render',
  'unstable_batchedUpdates',
  'unstable_flushDiscreteUpdates',
  'unstable_renderSubtreeIntoContainer',
  'unstable_runWithPriority',
  'version',
] as const;

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
      colorLog('\n📦 Starting shared dependencies build...', 'blue');
      const rootDir = getWorkspaceRoot();
      const nodeModulesDir = join(rootDir, 'node_modules');
      const outputDir = join(rootDir, 'dist/opt/zextras/admin/iris/shared-dependencies');

      colorLog(`Output directory: ${outputDir}`, 'cyan');
      if (existsSync(outputDir)) {
        rmSync(outputDir, { recursive: true, force: true });
      }
      mkdirSync(outputDir, { recursive: true });
      colorLog('Created output directory', 'gray');

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
