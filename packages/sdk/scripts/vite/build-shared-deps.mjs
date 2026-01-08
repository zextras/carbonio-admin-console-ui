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
		type: 'wrap-cjs' // Wrap CJS with both default and named exports
	},
	{
		name: 'react-dom',
		entry: resolve(nodeModulesDir, 'react-dom/cjs/react-dom.production.js'),
		outputName: 'client.mjs',
		type: 'wrap-cjs' // Wrap CJS with both default and named exports
	},
	{
		name: 'lodash-es',
		entry: resolve(nodeModulesDir, 'lodash-es/lodash.js'),
		outputName: 'lodash.mjs',
		type: 'build'
	},
	{
		name: 'styled-components',
		entry: resolve(nodeModulesDir, 'styled-components/dist/styled-components.browser.esm.js'),
		outputName: 'styled-components.browser.esm.mjs',
		type: 'build'
	},
	{
		name: 'i18next',
		entry: resolve(nodeModulesDir, 'i18next/i18next.js'),
		outputName: 'i18next.mjs',
		type: 'build'
	},
	{
		name: '@zextras/carbonio-design-system',
		entry: resolve(nodeModulesDir, '@zextras/carbonio-design-system/dist/zapp-ui.bundle.mjs'),
		outputName: 'carbonio-design-system.mjs',
		type: 'copy' // Just copy, already bundled ESM
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
					minify: true,
					platform: 'browser',
				});

				// Read the generated ESM and append manual named exports
				const esmCode = readFileSync(esmPath, 'utf-8');

				// All React exports that should be available as named exports
				const reactExports = [
					'Children', 'Component', 'Fragment', 'Profiler', 'PureComponent', 'StrictMode',
					'Suspense', '__COMPILER_RUNTIME', 'cache', 'cacheSignal', 'cloneElement',
					'createContext', 'createElement', 'createRef', 'forwardRef', 'isValidElement',
					'lazy', 'memo', 'startTransition', 'unstable_useCacheRefresh', 'use',
					'useActionState', 'useCallback', 'useContext', 'useDebugValue', 'useDeferredValue',
					'useEffect', 'useEffectEvent', 'useId', 'useImperativeHandle', 'useInsertionEffect',
					'useLayoutEffect', 'useMemo', 'useOptimistic', 'useReducer', 'useRef', 'useState',
					'useSyncExternalStore', 'useTransition', 'version'
				];

				// Get the export variable name from the esm output (usually something like "export default X();")
				const defaultMatch = esmCode.match(/export default (\w+)\(\);/);
				const defaultVar = defaultMatch ? defaultMatch[1] : null;

				if (defaultVar) {
					// Append manual named exports before the default export
					let namedExports = '\n// Named exports for compatibility\n';
					reactExports.forEach(exp => {
						namedExports += `export const ${exp} = ${defaultVar}.${exp};\n`;
					});

					// Replace the default export line with named exports + default export
					const modifiedCode = esmCode.replace(
						/export default \w+\(\);/,
						namedExports + 'export default ' + defaultVar + '();'
					);

					writeFileSync(esmPath, modifiedCode, 'utf-8');
				}

				console.log(`  ✓ Wrapped ${depConfig.name} with named exports`);
				continue;
			}

			// For packages that need building, use Vite
			await build({
				entry: depConfig.entry,
				configFile: false,
				mode: 'production',
				build: {
					lib: {
						entry: depConfig.entry,
						name: depConfig.name,
						fileName: depConfig.outputName,
						formats: ['esm'],
					},
					outDir: outputDir,
					emptyOutDir: false,
					sourcemap: false,
					rollupOptions: {
						external: [],
						output: {
							globals: {},
							// Remove .esm.js suffix that Vite adds
							entryFileNames: '[name].mjs'
						}
					},
					target: 'esnext',
					minify: true
				},
				define: {
					'process.env.NODE_ENV': JSON.stringify('production')
				},
				resolve: {
					alias: {
						// Point react-dom to its client export
						'react-dom': resolve(nodeModulesDir, 'react-dom')
					}
				}
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
