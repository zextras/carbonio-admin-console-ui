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
				test: {
					include: [
						'**/*.unit.test.*',
						'!src/**/*.browser.{test,spec}.{ts,tsx}',
						'!src/**/*.e2e.{test,spec}.{ts,tsx}'
					],
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
				test: {
					include: ['/**/*.browser.test.*'],
					name: 'browser',
					browser: {
						enabled: true,
						instances: [{ browser: 'chromium' }]
					},
					exclude: ['dist/**', 'node_modules/**'],
					globals: true,
					css: true,
					clearMocks: true,
					testTimeout: 30000,
					retry: process.env.CI ? 2 : 0, // Retry in CI for flaky tests
					pool: 'threads',
					poolOptions: {
						threads: {
							singleThread: true
						}
					}
				}
			}
		]
	}
});
