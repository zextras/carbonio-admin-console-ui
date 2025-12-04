/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'node:child_process';
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { createModuleRollupOptions } from '../../vite.rollup.config';

const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();
const packageName = 'carbonio-admin-ui-storage';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	mode: mode || process.env.NODE_ENV || 'production',
	plugins: [
		react(),
		{
			name: 'add-module-registration',
			generateBundle(_options, bundle) {
				for (const fileName in bundle) {
					const chunk = bundle[fileName];
					if (chunk.type === 'chunk' && fileName.startsWith('app.')) {
						chunk.code += `\nif (typeof __ZAPP_HMR_EXPORT__ !== 'undefined' && __ZAPP_ENTRY__) { const component = __ZAPP_ENTRY__.default || __ZAPP_ENTRY__; __ZAPP_HMR_EXPORT__['${packageName}'](component); }\n`;
					}
				}
			}
		}
	],
	resolve: {
		alias: {
			'app-entrypoint': resolve(__dirname, 'src/app.tsx')
		}
	},
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
	},
	build: {
		outDir: `dist/source/${commitHash}`,
		emptyOutDir: true,
		lib: {
			entry: 'src/app.tsx',
			formats: ['iife'],
			name: '__ZAPP_ENTRY__',
			fileName: () => 'main.[hash].js'
		},
		rollupOptions: createModuleRollupOptions({ packageName }),
		cssCodeSplit: false,
		sourcemap: true,
		minify: mode === 'development' ? false : 'esbuild',
		target: 'es2020'
	},
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' }
	}
}));
