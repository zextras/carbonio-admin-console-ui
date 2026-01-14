/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import path from 'node:path';
import baseConfig from '../../vitest.config.base.js';

export default mergeConfig(
	baseConfig,
	defineConfig({
		test: {
			setupFiles: [path.resolve(__dirname, './vitest-jsdom-setup.ts')],
			include: ['src/**/*.{test,test.browser}.{ts,tsx}'],
			exclude: [
				'node_modules/**',
				'dist/**',
				'src/**/*.stories.tsx',
				'src/**/stories-helpers.ts(x)?'
			],
			coverage: {
				exclude: [
					'src/**/*.stories.tsx',
					'src/**/stories-helpers.ts(x)?',
					'src/testUtils/**',
					'src/types/**',
					'src/icons/tsTemplate.ts'
				]
			}
		}
	})
);
