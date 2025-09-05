import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base.js';
import path from 'path';

export default mergeConfig(
	baseConfig,
	defineConfig({
		test: {
			exclude: ['packages/template/*']
		},
		resolve: {
			alias: {
				'@zextras/admin-ui-bootstrapper': path.resolve(
					__dirname,
					'./__mocks__/admin-ui-bootstrapper.ts'
				),
				bootstrapper: path.resolve(__dirname, './__mocks__/bootstrapper.ts')
			}
		}
	})
);
