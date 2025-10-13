/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { execSync } from 'node:child_process';

const commitHash =
	process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();
const packageName = 'carbonio-admin-console-ui';
const basePath = `/static/iris/${packageName}/${commitHash}/`;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		{
			name: 'add-module-registration',
			generateBundle(_options, bundle) {
				for (const fileName in bundle) {
					const chunk = bundle[fileName];
					if (chunk.type === 'chunk' && fileName.startsWith('main.')) {
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
		rollupOptions: {
			external: [
				'react',
				'react-dom',
				'react-router-dom',
				'styled-components',
				'@zextras/carbonio-design-system',
				'@zextras/admin-ui-bootstrap',
				'lodash',
				'i18next',
				'react-i18next'
			],
			output: {
				exports: 'default',
				interop: 'compat',
				globals: {
					react: '__ZAPP_SHARED_LIBRARIES__.react',
					'react-dom': '__ZAPP_SHARED_LIBRARIES__["react-dom"]',
					'react-router-dom': '__ZAPP_SHARED_LIBRARIES__["react-router-dom"]',
					'styled-components': '__ZAPP_SHARED_LIBRARIES__["styled-components"]',
				'@zextras/carbonio-design-system':
					'__ZAPP_SHARED_LIBRARIES__["@zextras/carbonio-design-system"]',
				'@zextras/admin-ui-bootstrap':
					`__ZAPP_SHARED_LIBRARIES__["@zextras/admin-ui-bootstrap"]["${packageName}"]`,
				lodash: '__ZAPP_SHARED_LIBRARIES__.lodash',
					i18next: '__ZAPP_SHARED_LIBRARIES__.i18next',
					'react-i18next': '__ZAPP_SHARED_LIBRARIES__["react-i18next"]'
				},
				assetFileNames: '[name].[hash][extname]',
				chunkFileNames: '[name].[hash].js',
				entryFileNames: 'main.[hash].js'
			}
		},
		cssCodeSplit: false,
		sourcemap: true,
		minify: 'esbuild',
		target: 'es2020'
	},
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' }
	}
});
