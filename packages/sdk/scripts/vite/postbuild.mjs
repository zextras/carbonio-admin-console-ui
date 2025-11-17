#!/usr/bin/env node
/* eslint-disable no-console */

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readFileSync, writeFileSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

// The project root is the current working directory where the script is called from
const projectRoot = process.cwd();

const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));

const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();

const distDir = join(projectRoot, 'dist', 'source', commitHash);

const files = readdirSync(distDir);
const cssFile = files.find((f) => f.startsWith('style.') && f.endsWith('.css'));

const jsFile = files.find(
	(f) =>
		(f.startsWith('main.') || f.startsWith('index.') || f.startsWith('app.')) &&
		f.endsWith('.js') &&
		!f.endsWith('.map')
);

if (!jsFile) {
	console.error('JavaScript file not found!');
	console.error(
		'Available files:',
		files.filter((f) => f.endsWith('.js'))
	);
	process.exit(1);
}

if (!cssFile) {
	console.warn('No CSS file found...');
}

const basePath = `/static/iris/${pkg.carbonio.name}/${commitHash}/`;

const componentJson = {
	name: pkg.carbonio.name,
	js_entrypoint: `${basePath}${jsFile}`,
	description: pkg.description,
	version: pkg.version,
	commit: commitHash,
	priority: pkg.carbonio.priority,
	type: pkg.carbonio.type,
	attrKey: pkg.carbonio.attrKey || '',
	icon: pkg.carbonio.icon || 'CubeOutline',
	display: pkg.carbonio.display,
	sentryDsn: pkg.carbonio.sentryDsn || ''
};

writeFileSync(join(distDir, 'component.json'), JSON.stringify(componentJson, null, '\t'));

console.log('Generated component.json');

// Copy CHANGELOG.md if it exists
const changelogPath = join(projectRoot, 'CHANGELOG.md');
if (existsSync(changelogPath)) {
	copyFileSync(changelogPath, join(distDir, 'CHANGELOG.md'));
	console.log('Copied CHANGELOG.md');
}

console.log('\nBuild completed successfully!');
console.log(`Output directory: ${distDir}`);
