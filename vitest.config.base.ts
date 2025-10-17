/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
	test: {
		globals: true,
		projects: [
			{
				optimizeDeps: {
					include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime']
				},
				test: {
					environment: 'jsdom',
					setupFiles: [path.resolve(__dirname, './vitest-jsdom-setup.ts')],
					alias: {
						'admin-ui-test-utils': path.resolve(
							__dirname,
							'./packages/test-utils/src/index.jsdom.ts'
						),
						'@zextras/admin-ui-bootstrap': path.resolve(
							__dirname,
							'./__mocks__/@zextras/admin-ui-bootstrap.js'
						)
					},
					include: ['src/**/*.test.{ts,tsx}'],
					exclude: ['dist/**', 'node_modules/**', '**/*.browser.test.{ts,tsx}'],
					name: 'unit',
					globals: true,
					css: true,
					clearMocks: true,
					mockReset: true,
					restoreMocks: true,
					testTimeout: 10000
				}
			},
			{
				plugins: [
					react(),
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
				optimizeDeps: {
					include: [
						'@zextras/carbonio-design-system',
						'i18next',
						'react-i18next',
						'react-router-dom'
					]
				},
				test: {
					environment: 'browser',
					setupFiles: [path.resolve(__dirname, './vitest-browser-setup.ts')],
					alias: {
						'admin-ui-test-utils': path.resolve(
							__dirname,
							'./packages/test-utils/src/index.browser.ts'
						),
						'@zextras/admin-ui-bootstrap': path.resolve(
							__dirname,
							'./__mocks__/@zextras/admin-ui-bootstrap.js'
						)
					},
					include: ['**/*.browser.test.{ts,tsx}'],
					name: 'browser',
					browser: {
						provider: 'playwright',
						viewport: { width: 834, height: 2000 },
						enabled: true,
						headless: !!process.env.CI,
						instances: [
							{
								browser: 'chromium',
								screenshotFailures: !process.env.CI
							}
						]
					},
					exclude: ['dist/**', 'node_modules/**'],
					globals: true,
					css: true,
					clearMocks: true,
					testTimeout: 5_000
				}
			}
		],
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'json', 'html', 'lcov'],
			reportsDirectory: './coverage',
			exclude: [
				'coverage/**',
				'dist/**',
				'**/node_modules/**',
				'**/[.]**',
				'packages/*/test{,s}/**',
				'**/*.d.ts',
				'**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
				'**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
				'**/*.config.{js,ts}',
				'**/*.test.{ts,tsx}',
				'**/*.spec.{ts,tsx}'
			],
			include: ['src/**/*.{ts,tsx}'],
			all: true
		}
	}
});
