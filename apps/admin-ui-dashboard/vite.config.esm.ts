/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { createModuleRollupOptions } from '../../vite.rollup.config';

import pkg from './package.json';

const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();
const packageName = pkg.carbonio.name;

/**
 * ESM Module Configuration for Admin Dashboard
 *
 * This configuration builds the admin-ui-dashboard as an ESM microfrontend module.
 * It differs from the IIFE build by:
 * - Using ES module format instead of IIFE
 * - Exporting the component as an ES module
 * - Proper code splitting support
 * - Dynamic imports support
 */
export default defineConfig(({ mode }) => ({
	mode: mode || process.env.NODE_ENV || 'production',
	plugins: [
		react({
			babel: {
				plugins: ['babel-plugin-styled-components']
			}
		})
	],
	resolve: {
		alias: {
			'app-entrypoint': resolve(__dirname, 'src/index.ts'),
			path: 'path-browserify'
		}
	},
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
	},
	build: {
		outDir: `dist/esm/${commitHash}`,
		emptyOutDir: true,
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: () => 'index.[hash].js'
		},
		rollupOptions: {
			...createModuleRollupOptions({ packageName }),
			output: {
				...(createModuleRollupOptions({ packageName }).output as Record<string, unknown>),
				format: 'es',
				entryFileNames: 'index.[hash].js',
				chunkFileNames: '[name].[hash].chunk.js',
				// Enable code splitting for ESM
				inlineDynamicImports: false,
				manualChunks: undefined
			}
		},
		cssCodeSplit: false,
		sourcemap: true,
		minify: mode === 'development' ? false : 'esbuild',
		target: 'es2020'
	},
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' }
	}
}));
