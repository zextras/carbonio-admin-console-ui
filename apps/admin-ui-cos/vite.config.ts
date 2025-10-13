/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'node:child_process';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const commitHash =
	process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();
const packageName = 'carbonio-admin-cos';
const basePath = `/static/iris/${packageName}/${commitHash}/`;

export default defineConfig(({ mode }) => {
	const isDev = mode === 'development';

	return {
		plugins: [
			react({
				babel: {
					plugins: ['babel-plugin-styled-components']
				}
			}),
			svgr({
				svgrOptions: {
					ref: true,
					svgo: false,
					titleProp: true,
					exportType: 'default'
				},
				include: '**/*.svg'
			}),
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
		define: {
			PACKAGE_VERSION: JSON.stringify(process.env.npm_package_version),
			ZIMBRA_PACKAGE_VERSION: JSON.stringify(
				process.env.npm_package_version?.split('-')[0] || '0.0.0'
			),
			PACKAGE_NAME: JSON.stringify(packageName),
			'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
		},
		resolve: {
			alias: {
				path: 'path-browserify'
			}
		},
		build: {
			outDir: `dist/source/${commitHash}`,
			emptyOutDir: true,
			sourcemap: true,
			cssCodeSplit: false, // Bundle all CSS into one file
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
					'react-i18next',
					'lodash',
					'react-router-dom',
					'styled-components',
					'@emotion/react',
					'@emotion/styled',
					'@zextras/carbonio-ui-preview',
					'@zextras/admin-ui-bootstrap',
					'@zextras/carbonio-design-system',
					'darkreader',
					'msw'
				],
				output: {
					exports: 'default',
					entryFileNames: '[name].[hash].js',
					chunkFileNames: '[name].[hash].chunk.js',
					inlineDynamicImports: true,
					assetFileNames: (assetInfo) => {
						if (assetInfo.name?.endsWith('.css')) {
							return 'style.[hash].css';
						}
						return '[name].[hash][extname]';
					},
					interop: 'compat',
					globals: {
						react: '__ZAPP_SHARED_LIBRARIES__["react"]',
						'react-dom': '__ZAPP_SHARED_LIBRARIES__["react-dom"]',
						'react-i18next': '__ZAPP_SHARED_LIBRARIES__["react-i18next"]',
						lodash: '__ZAPP_SHARED_LIBRARIES__["lodash"]',
						'react-router-dom': '__ZAPP_SHARED_LIBRARIES__["react-router-dom"]',
						'styled-components': '__ZAPP_SHARED_LIBRARIES__["styled-components"]',
						'@emotion/react': '__ZAPP_SHARED_LIBRARIES__["@emotion/react"]',
						'@emotion/styled': '__ZAPP_SHARED_LIBRARIES__["@emotion/styled"]',
						'@zextras/carbonio-ui-preview':
							'__ZAPP_SHARED_LIBRARIES__["@zextras/carbonio-ui-preview"]',
						'@zextras/admin-ui-bootstrap': `__ZAPP_SHARED_LIBRARIES__["@zextras/admin-ui-bootstrap"]["${packageName}"]`,
						'@zextras/carbonio-design-system':
							'__ZAPP_SHARED_LIBRARIES__["@zextras/carbonio-design-system"]',
						darkreader: '__ZAPP_SHARED_LIBRARIES__["darkreader"]',
						msw: '__ZAPP_SHARED_LIBRARIES__["msw"]'
					}
				}
			}
		},
		base: isDev ? '/' : basePath,
		publicDir: isDev ? 'public' : false,
		server: {
			port: 3000,
			strictPort: false
		}
	};
});
