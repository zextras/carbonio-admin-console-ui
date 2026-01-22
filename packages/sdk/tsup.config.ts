import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['scripts/index.ts', 'scripts/build.ts', 'scripts/build-shell.ts', 'scripts/deploy.ts', 'scripts/install.ts'],
	format: ['esm'],
	dts: false,
	clean: true,
	sourcemap: false,
	bundle: true,
	target: 'node22',
	outDir: 'dist',
	shims: true,
});
