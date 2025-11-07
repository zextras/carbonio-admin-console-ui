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

// Find and update the browser project's setupFiles
if (merged.test?.projects) {
	const browserProject = merged.test.projects.find((p) => p.test?.name === 'browser');
	if (browserProject?.test) {
		browserProject.test.setupFiles = [
			path.resolve(import.meta.dirname, './vitest-browser-setup.ts')
		];
	}
}

export default merged;
