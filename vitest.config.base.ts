/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		projects: [
			{
				optimizeDeps: {
					include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime']
				},
				test: {
					include: ['src/**/*.unit.test.{ts,tsx}', '!src/**/*.browser.test.{ts,tsx}'],
					exclude: ['dist/**', 'node_modules/**'],
					name: 'unit',
					environment: 'jsdom',
					globals: true,
					css: true,
					clearMocks: true,
					mockReset: true,
					restoreMocks: true,
					testTimeout: 10000
				}
			},
			{
				optimizeDeps: {
					include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime']
				},
				test: {
					include: ['src/**/*.browser.test.{ts,tsx}', 'src/**/*.unit.test.{ts,tsx}'],
					name: 'browser',
					browser: {
						provider: 'playwright',
						enabled: true,
						headless: true,
						instances: [{ browser: 'chromium' }]
					},
					exclude: ['dist/**', 'node_modules/**'],
					globals: true,
					css: true,
					clearMocks: true,
					testTimeout: 30000
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
