#!/usr/bin/env node

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	readFileSync,
	writeFileSync,
	mkdirSync,
	readdirSync,
	copyFileSync,
	existsSync
} from 'node:fs';
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

const pkgRel = process.env.PKG_REL || '1';
const installMode = pkg.carbonio.installMode || 'admin';
const copyright = pkg.carbonio.copyright || '2022, Zextras &lt;https://www.zextras.com&gt;';

const pkgBuild = `# This package contains the assets for carbonio ui components (aka zapp)

# the package uses commits paths to reduce caching issues as much as possible
# but it doesn't support multiple versions installed at the same time
# this could lead to a loading issue if a user is loading the page exactly during the
# upgrade, but so far there is nothing we can do about it (we would need to coordinate multiple nginx).

pkgname="${pkg.carbonio.name}"
pkgver="${pkg.version}"
pkgrel="${pkgRel}"
pkgdesc="${pkg.description}"
maintainer="Zextras (packages@zextras.com)"
arch=("x86_64")
license=("AGPL-3.0-only")
copyright=("${copyright}")
section="admin"
priority="optional"
url="https://github.com/zextras"
depends=(
  "carbonio-nginx"
  "carbonio-webui-i18n"
  "jq"
)

source=('source')
sha256sums=('SKIP')


package() {
  cd "\${srcdir}"
  mkdir -p "\${pkgdir}/opt/zextras/${installMode}/iris/\${pkgname}"
  cp -a source/* "\${pkgdir}/opt/zextras/${installMode}/iris/\${pkgname}"
  chown root:root -R "\${pkgdir}/opt/zextras/${installMode}/iris/\${pkgname}/${commitHash}"
  chmod 644 -R "\${pkgdir}/opt/zextras/${installMode}/iris/\${pkgname}/${commitHash}"
  find "\${pkgdir}/opt/zextras/${installMode}/iris/\${pkgname}/${commitHash}" -type d -exec chmod a+x "{}" \\;
  ln -sf /opt/zextras/${installMode}/iris/i18n "\${pkgdir}/opt/zextras/${installMode}/iris/\${pkgname}/${commitHash}/i18n"
}

postinst() {
  # copy the index.html to the current directory, no redirect is needed
  mkdir -p "/opt/zextras/${installMode}/iris/${pkg.carbonio.name}/current"

  # not every package has a index.html
  cd "/opt/zextras/${installMode}/iris/${pkg.carbonio.name}/${commitHash}"
  find . -name "*.html" -exec cp --parents "{}" /opt/zextras/${installMode}/iris/${pkg.carbonio.name}/current/ \\;

  # re-generate the component list, for every component
  # depth should be 3 since the path should be iris/NAME/COMMIT/component.json
  find /opt/zextras/${installMode}/iris/ \\
    -maxdepth 3 \\
    -mindepth 3 \\
    -type f \\
    -name component.json \\
    -printf '%T@ %p\\n' \\
    | sort -rn \\
    | awk '{
        n = split($2, path, "/")
        component = path[6]

        if (!seen[component]++) {
            print $2
        }
    }' \\
    | xargs jq -s '{"components":.}' >/opt/zextras/${installMode}/iris/components.json
}
`;

mkdirSync(join(projectRoot, 'dist'), { recursive: true });
writeFileSync(join(projectRoot, 'dist', 'PKGBUILD'), pkgBuild);

console.log('Generated PKGBUILD');
console.log('\nBuild completed successfully!');
console.log(`Output directory: ${distDir}`);
