#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { build } from 'vite';
import { buildSync } from 'esbuild';
import { mkdirSync, readFileSync, copyFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../../../..');
const nodeModulesDir = join(rootDir, 'node_modules');

/**
 * Build configuration for each shared dependency
 * We use Vite to bundle them into browser-compatible ESM
 */
const sharedDepsConfig = [
  {
    name: 'react',
    entry: resolve(nodeModulesDir, 'react/cjs/react.production.js'),
    outputName: 'index.mjs',
    type: 'wrap-cjs',
  },
  {
    name: 'react-dom',
    entry: resolve(nodeModulesDir, 'react-dom/cjs/react-dom.production.js'),
    outputName: 'client.mjs',
    type: 'wrap-cjs',
  },
  {
    name: 'lodash-es',
    entry: resolve(nodeModulesDir, 'lodash-es/lodash.js'),
    outputName: 'lodash.mjs',
    type: 'build',
  },
  {
    name: 'styled-components',
    entry: resolve(nodeModulesDir, 'styled-components/dist/styled-components.browser.esm.js'),
    outputName: 'styled-components.browser.esm.mjs',
    type: 'build',
    // styled-components must use the shared React instance to avoid context issues
    external: ['react', 'react-dom'],
  },
  {
    name: 'i18next',
    entry: resolve(nodeModulesDir, 'i18next/i18next.js'),
    outputName: 'i18next.mjs',
    type: 'build',
  },
  {
    name: 'react-i18next',
    entry: resolve(nodeModulesDir, 'react-i18next/dist/es/index.js'),
    outputName: 'react-i18next.mjs',
    type: 'build',
    // react-i18next must use the shared React and i18next instances to avoid context issues
    external: ['react', 'react-dom', 'i18next'],
  },
  {
    name: '@tanstack/react-query',
    entry: resolve(nodeModulesDir, '@tanstack/react-query/build/modern/index.js'),
    outputName: 'react-query.mjs',
    type: 'build',
    // react-query must use the shared React instance to avoid context issues
    external: ['react', 'react-dom'],
  },
  {
    name: 'react-router-dom',
    entry: resolve(nodeModulesDir, 'react-router-dom/esm/react-router-dom.js'),
    outputName: 'react-router-dom.mjs',
    type: 'build',
    // react-router-dom must use the shared React instance to avoid context issues
    external: ['react', 'react-dom'],
  },
  {
    name: 'zustand',
    entry: resolve(nodeModulesDir, 'zustand/esm/index.mjs'),
    outputName: 'zustand.mjs',
    type: 'build',
    // zustand must use the shared React instance for hooks to work correctly
    external: ['react', 'react-dom'],
  },
];

/**
 * Build shared dependencies using Vite library mode
 * This converts CommonJS to ESM and handles all dependencies
 */
export async function buildSharedDeps(commitHash) {
  const outputDir = join(rootDir, 'package/opt/zextras/admin/iris/shared-dependencies', commitHash);

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });

  console.log(`Building shared dependencies to: ${outputDir}`);

  for (const depConfig of sharedDepsConfig) {
    console.log(`Building ${depConfig.name}...`);

    try {
      // For pre-bundled packages, just copy the file
      if (depConfig.type === 'copy') {
        const outputPath = join(outputDir, depConfig.outputName);
        copyFileSync(depConfig.entry, outputPath);
        console.log(`  ✓ Copied ${depConfig.name}`);
        continue;
      }

      // For ESM packages that need esbuild for proper externalization
      if (depConfig.type === 'build-esbuild') {
        const entryDir = dirname(depConfig.entry);
        buildSync({
          entryPoints: [depConfig.entry],
          bundle: true,
          format: 'esm',
          outfile: join(outputDir, depConfig.outputName),
          target: 'esnext',
          minify: true,
          platform: 'browser',
          external: depConfig.external || [],
          resolveExtensions: ['.js'],
          mainFields: ['module', 'main'],
          conditions: ['import'],
          // Preserve source files for proper module resolution
          absWorkingDir: entryDir,
        });
        console.log(`  ✓ Built ${depConfig.name}`);
        continue;
      }

      // For CJS packages that need wrapping with named exports (React, react-dom)
      if (depConfig.type === 'build-esbuild') {
        buildSync({
          entryPoints: [depConfig.entry],
          bundle: true,
          format: 'esm',
          outfile: join(outputDir, depConfig.outputName),
          target: 'esnext',
          minify: true,
          platform: 'browser',
          external: ['react', 'i18next'],
        });
        console.log(`  ✓ Built ${depConfig.name}`);
        continue;
      }

      // For CJS packages that need wrapping with named exports (React, react-dom)
      if (depConfig.type === 'wrap-cjs') {
        // Use esbuild to bundle as ESM
        const esmPath = join(outputDir, depConfig.outputName);
        buildSync({
          entryPoints: [depConfig.entry],
          bundle: true,
          format: 'esm',
          outfile: esmPath,
          target: 'esnext',
          minify: false, // Don't minify - we need to access properties for named exports
          platform: 'browser',
        });

        // Read the generated ESM and append manual named exports
        const esmCode = readFileSync(esmPath, 'utf-8');

        // All React exports that should be available as named exports
        const reactExports = [
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
        ];

        // Get the export variable name from the esm output
        // esbuild may output either:
        //   - "export default X();" (older versions)
        //   - "export { V as default };" (newer versions)
        let defaultMatch = esmCode.match(/export default (\w+)\(\);/);
        let defaultVar = defaultMatch ? defaultMatch[1] : null;
        let exportStyle = 'function-call'; // "export default X();"

        // Try the newer esbuild format: "export { V as default };"
        if (!defaultVar) {
          defaultMatch = esmCode.match(/export\s*\{\s*(\w+)\s+as\s+default\s*\};?/);
          if (defaultMatch) {
            defaultVar = defaultMatch[1];
            exportStyle = 'named-as-default'; // "export { V as default };"
          }
        }

        if (defaultVar) {
          // Append manual named exports before the default export
          let namedExports = '\n// Named exports for compatibility\n';
          
          // For "export { V as default };" style, V is already the module object
          // For "export default X();" style, we need to call X() to get the module object
          if (exportStyle === 'named-as-default') {
            namedExports += `const _exports = ${defaultVar};\n`;
          } else {
            namedExports += `const _exports = ${defaultVar}();\n`;
          }

          if (depConfig.name === 'react') {
            reactExports.forEach((exp) => {
              namedExports += `export const ${exp} = _exports.${exp};\n`;
            });
          } else {
            // react-dom exports - need all the methods from the full react-dom package
            const reactDOMExports = [
              'unstable_batchedUpdates',
              'version',
              'createPortal',
              'flushSync',
              'findDOMNode',
              'render',
              'hydrate',
              'unstable_renderSubtreeIntoContainer',
              'unstable_flushDiscreteUpdates',
              'unstable_runWithPriority',
            ];
            reactDOMExports.forEach((exp) => {
              namedExports += `export const ${exp} = _exports.${exp};\n`;
            });
          }

          // Replace the default export line with named exports + default export
          let modifiedCode;
          if (exportStyle === 'named-as-default') {
            modifiedCode = esmCode.replace(
              /export\s*\{\s*\w+\s+as\s+default\s*\};?/,
              namedExports + 'export { ' + defaultVar + ' as default };',
            );
          } else {
            modifiedCode = esmCode.replace(
              /export default \w+\(\);/,
              namedExports + 'export default ' + defaultVar + '();',
            );
          }

          writeFileSync(esmPath, modifiedCode, 'utf-8');
        } else {
          console.warn(`  ⚠ Could not find default export pattern in ${depConfig.name}, named exports not added`);
        }

        console.log(`  ✓ Wrapped ${depConfig.name} with named exports`);
        continue;
      }

      // For packages that need building, use Vite
      // Get the output filename without extension for the entry file name
      const outputBaseName = depConfig.outputName.replace(/\.mjs$/, '');
      await build({
        entry: depConfig.entry,
        configFile: false,
        mode: 'production',
        build: {
          lib: {
            entry: depConfig.entry,
            name: depConfig.name,
            fileName: () => outputBaseName,
            formats: ['esm'],
          },
          outDir: outputDir,
          emptyOutDir: false,
          sourcemap: false,
          rollupOptions: {
            // Use external from config, default to empty array
            external: depConfig.external || [],
            output: {
              globals: {},
              // Use the configured output name
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
            // Point react-dom to its client export
            'react-dom': resolve(nodeModulesDir, 'react-dom'),
          },
        },
      });
      console.log(`  ✓ Built ${depConfig.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to build ${depConfig.name}:`, error.message);
      console.error(error.stack);
      throw error;
    }
  }

  console.log('Shared dependencies build completed!');
}

// Main execution - only run when executed directly (not when imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const commitHash = args[0] || process.env.COMMIT_HASH;

  if (!commitHash) {
    console.error('Error: COMMIT_HASH must be provided');
    process.exit(1);
  }

  buildSharedDeps(commitHash).catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
  });
}
