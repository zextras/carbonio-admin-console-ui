/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');
const bootstrapPackagePath = join(rootDir, 'apps/admin-ui-bootstrap/package.json');
const bootstrapPkg = JSON.parse(readFileSync(bootstrapPackagePath, 'utf8'));

/**
 * Extracts version from a semver range (e.g., "^19.1.0" -> "19.1.0")
 */
function extractVersion(range) {
	if (!range) return null;
	return range.replace(/^[^0-9]*/, ''); // Remove ^, ~, >=, etc.
}

/**
 * Returns CDN URLs for shared dependencies based on installed versions
 */
export function getSharedDependencyCdnUrls() {
	const deps = {
		...bootstrapPkg.dependencies,
		...bootstrapPkg.devDependencies,
	};

	const urls = {};

	// Core shared dependencies
	const sharedDeps = [
		'react',
		'react-dom',
		'react-i18next',
		'lodash-es',
		'react-router-dom',
		'styled-components',
		'i18next',
		'@emotion/react',
		'@emotion/styled',
	];

	for (const dep of sharedDeps) {
		const version = extractVersion(deps[dep]);
		if (version) {
			if (dep === 'react-dom') {
				urls[dep] = `https://esm.sh/react-dom@${version}/client`;
			} else {
				urls[dep] = `https://esm.sh/${dep}@${version}`;
			}
		}
	}

	// Design system (always use latest from CDN)
	urls['@zextras/carbonio-design-system'] = 'https://esm.sh/@zextras/carbonio-design-system';

	return urls;
}

/**
 * Returns the list of shared dependency names (matching SHARED_EXTERNALS)
 */
export function getSharedDependencyNames() {
	return Object.keys(getSharedDependencyCdnUrls());
}
