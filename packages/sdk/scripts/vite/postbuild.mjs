#!/usr/bin/env node

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// The project root is the current working directory where the script is called from
const projectRoot = process.cwd();

const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));

const commitHash =
	process.env.COMMIT_HASH || execSync('git rev-parse --short HEAD').toString().trim();

const distDir = join(projectRoot, 'dist', 'source', commitHash);

const files = readdirSync(distDir);
const cssFile = files.find((f) => f.startsWith('style.') && f.endsWith('.css'));

const jsFile = files.find(
	(f) =>
		(f.startsWith('main.') || f.startsWith('index.')) && f.endsWith('.js') && !f.endsWith('.map')
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

const componentJson = {
	name: pkg.carbonio.name,
	version: pkg.version,
	description: pkg.description,
	commit: commitHash,
	priority: pkg.carbonio.priority,
	type: pkg.carbonio.type,
	attrKey: pkg.carbonio.attrKey || '',
	icon: pkg.carbonio.icon || 'CubeOutline',
	display: pkg.carbonio.display,
	sentryDsn: pkg.carbonio.sentryDsn || '',
	js: jsFile
};

if (cssFile) {
	componentJson.css = cssFile;
}

writeFileSync(join(distDir, 'component.json'), JSON.stringify(componentJson, null, 2));

console.log('Generated component.json');

const pkgRel = process.env.PKG_REL || '1';
const pkgBuild = `# Maintainer: Zextras <packages@zextras.com>
pkgname="${pkg.carbonio.name}"
pkgver="${pkg.version}"
pkgrel="${pkgRel}"
pkgdesc="${pkg.description}"
arch=('x86_64')
license=('AGPL3')
url="https://www.zextras.com/carbonio/"
depends=('carbonio-admin-ui')

package() {
	cd "\${srcdir}/../source/${commitHash}"
	install -D -m 644 component.json "\${pkgdir}/usr/share/carbonio/web/iris/static/iris/${pkg.carbonio.name}/${commitHash}/component.json"
	install -D -m 644 ${jsFile} "\${pkgdir}/usr/share/carbonio/web/iris/static/iris/${pkg.carbonio.name}/${commitHash}/${jsFile}"
	${cssFile ? `install -D -m 644 ${cssFile} "\${pkgdir}/usr/share/carbonio/web/iris/static/iris/${pkg.carbonio.name}/${commitHash}/${cssFile}"` : ''}
	
	# Install source maps if they exist
	if [ -f "${jsFile}.map" ]; then
		install -D -m 644 "${jsFile}.map" "\${pkgdir}/usr/share/carbonio/web/iris/static/iris/${pkg.carbonio.name}/${commitHash}/${jsFile}.map"
	fi
	${
		cssFile
			? `if [ -f "${cssFile}.map" ]; then
		install -D -m 644 "${cssFile}.map" "\${pkgdir}/usr/share/carbonio/web/iris/static/iris/${pkg.carbonio.name}/${commitHash}/${cssFile}.map"
	fi`
			: ''
	}
}
`;

mkdirSync(join(projectRoot, 'dist'), { recursive: true });
writeFileSync(join(projectRoot, 'dist', 'PKGBUILD'), pkgBuild);

console.log('Generated PKGBUILD');
console.log('\nBuild completed successfully!');
console.log(`Output directory: ${distDir}`);
