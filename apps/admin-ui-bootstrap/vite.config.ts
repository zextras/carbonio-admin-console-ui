/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'node:child_process';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import { createBootstrapRollupOptions } from '../../vite.rollup.config';


// IMPORTANT: For production, always build with NODE_ENV=production and vite build --mode production
const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();
const packageName = 'carbonio-admin-ui';
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
			})
		],
		define: {
			COMMIT_ID: JSON.stringify(commitHash),
			BASE_PATH: JSON.stringify(basePath),
			'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
		},
		resolve: {
			alias: {
				path: 'path-browserify'
			},
			extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.d.ts']
		},
			build: {
				outDir: `dist/source/${commitHash}`,
				emptyOutDir: true,
				sourcemap: isDev, // Disable sourcemap in production for optimized build
				rollupOptions: createBootstrapRollupOptions(isDev)
			},
		base: basePath,
		publicDir: 'assets',
		server: {
			port: 3000,
			strictPort: false
		}
	};
});
