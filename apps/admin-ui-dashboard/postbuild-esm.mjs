#!/usr/bin/env node

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Post-build script for ESM builds
 * Displays build summary
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const projectRoot = process.cwd();
const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));
const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();
const distDir = join(projectRoot, 'dist', 'esm', commitHash);

if (!existsSync(distDir)) {
	console.error('❌ ESM build directory not found:', distDir);
	console.error('Please run the ESM build first: pnpm build:esm');
	process.exit(1);
}

const files = readdirSync(distDir);

const jsFile = files.find(
	(f) => f.startsWith('index.') && f.endsWith('.js') && !f.endsWith('.map')
);

const cssFile = files.find((f) => f.startsWith('style.') && f.endsWith('.css'));

if (!jsFile) {
	console.error('❌ JavaScript entry file not found!');
	console.error('Available files:', files.filter((f) => f.endsWith('.js')));
	process.exit(1);
}

console.log('\n✨ ESM build completed successfully!');
console.log(`📁 Output: ${distDir}`);
console.log(`📦 Entry: ${jsFile}`);
if (cssFile) {
	console.log(`🎨 Styles: ${cssFile}`);
} else {
	console.log('⚠️  No CSS file found');
}
