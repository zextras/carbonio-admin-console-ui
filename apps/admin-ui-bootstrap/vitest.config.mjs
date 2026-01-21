import { defineConfig, mergeConfig } from 'vitest/config';
import path from 'node:path';
import baseConfig from '../../vitest.config.base.js';

const customConfig = defineConfig({
	test: {
		exclude: ['packages/template/*']
	}
});

// Deep merge to override browser setup
const merged = mergeConfig(baseConfig, customConfig);

// Find and update the unit test project to remove bootstrap mock
if (merged.test?.projects) {
	const unitProject = merged.test.projects.find((p) => p.test?.name === 'unit');
	if (unitProject?.test?.alias) {
		// Remove the bootstrap module mock for unit tests in this app
		delete unitProject.test.alias['@zextras/admin-ui-bootstrap'];
	}

	const browserProject = merged.test.projects.find((p) => p.test?.name === 'browser');
	if (browserProject?.test) {
		browserProject.test.setupFiles = [
			path.resolve(import.meta.dirname, './vitest-browser-setup.ts')
		];
	}
}

export default merged;
