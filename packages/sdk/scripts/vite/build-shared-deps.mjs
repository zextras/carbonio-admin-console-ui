#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { build } from 'vite';
import { mkdirSync, readFileSync } from 'node:fs';
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
		entry: resolve(nodeModulesDir, 'react/index.js'),
		outputName: 'react.mjs'
	},
	{
		name: 'react-dom',
		entry: resolve(nodeModulesDir, 'react-dom/client.js'),
		outputName: 'react-dom-client.mjs'
	},
	{
		name: 'lodash-es',
		entry: resolve(nodeModulesDir, 'lodash-es/lodash.js'),
		outputName: 'lodash-es.mjs'
	},
	{
		name: 'styled-components',
		entry: resolve(nodeModulesDir, 'styled-components/dist/styled-components.browser.esm.js'),
		outputName: 'styled-components.mjs'
	},
	{
		name: 'i18next',
		entry: resolve(nodeModulesDir, 'i18next/i18next.js'),
		outputName: 'i18next.mjs'
	},
];

/**
 * Build shared dependencies using Vite library mode
 * This converts CommonJS to ESM and handles all dependencies
 */
export async function buildSharedDeps(commitHash) {
	const outputDir = join(rootDir, 'apps/admin-ui-bootstrap/dist/source', commitHash, 'shared-dependencies');

	// Ensure output directory exists
	mkdirSync(outputDir, { recursive: true });

	console.log(`Building shared dependencies to: ${outputDir}`);

	for (const depConfig of sharedDepsConfig) {
		console.log(`Building ${depConfig.name}...`);

		try {
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
