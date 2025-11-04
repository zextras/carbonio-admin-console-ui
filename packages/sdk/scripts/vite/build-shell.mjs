#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';

const cwd = process.cwd();
const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();

const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const mode = isDev ? 'development' : 'production';

console.log(`Building shell in ${mode} mode`);
console.log(`Commit hash: ${commitHash}`);

// Clean dist directory
const distPath = path.resolve(cwd, 'dist');
if (fs.existsSync(distPath)) {
	fs.rmSync(distPath, { recursive: true, force: true });
	console.log('Cleaned dist directory');
}

// Build with Vite
await build({
	configFile: path.resolve(cwd, 'vite.config.ts'),
	mode
});

console.log('\nRunning post-build tasks...');

const distDir = path.resolve(cwd, 'dist', 'source', commitHash);
const currentDir = path.resolve(cwd, 'dist', 'source', 'current');

// Create current directory
if (!fs.existsSync(currentDir)) {
	fs.mkdirSync(currentDir, { recursive: true });
}

// Copy index.html to current/
const indexHtmlSource = path.resolve(distDir, 'index.html');
const indexHtmlDest = path.resolve(currentDir, 'index.html');
if (fs.existsSync(indexHtmlSource)) {
	fs.copyFileSync(indexHtmlSource, indexHtmlDest);
	console.log('Copied index.html to current/');
}

// Generate commit file
const commitFilePath = path.resolve(distDir, 'commit');
fs.writeFileSync(commitFilePath, commitHash);
console.log('Generated commit file');

// Generate component.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(cwd, 'package.json'), 'utf-8'));

// Use different bundle names for dev vs production
const bundleName = isDev ? 'zapp-shell.bundle.js' : 'zapp-admin-ui.bundle.js';

const componentJson = {
	name: 'carbonio-admin-ui',
	js_entrypoint: `/static/iris/carbonio-admin-ui/${commitHash}/${bundleName}`,
	description: packageJson.description || '',
	version: packageJson.version,
	commit: commitHash,
	priority: -1,
	type: 'shell',
	attrKey: '',
	icon: 'CubeOutline',
	display: 'Admin Shell',
	sentryDsn: ''
};

fs.writeFileSync(
	path.resolve(distDir, 'component.json'),
	JSON.stringify(componentJson, null, '\t')
);
console.log('Generated component.json');

// Generate PKGBUILD
const pkgbuildContent = `# This package contains the assets for carbonio ui components (aka zapp)

# the package uses commits paths to reduce caching issues as much as possible
# but it doesn't support multiple versions installed at the same time
# this could lead to a loading issue if a user is loading the page exactly during the
# upgrade, but so far there is nothing we can do about it (we would need to coordinate multiple nginx).

pkgname="carbonio-admin-ui"
pkgver="${packageJson.version}"
pkgrel="1"
pkgdesc="${packageJson.description || 'The Zextras Carbonio web admin'}"
maintainer="Zextras (packages@zextras.com)"
arch=("x86_64")
license=("AGPL-3.0-only")
copyright=("2022, Zextras &lt;https://www.zextras.com&gt;")
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
  mkdir -p "\${pkgdir}/opt/zextras/admin/iris/\${pkgname}"
  cp -a source/* "\${pkgdir}/opt/zextras/admin/iris/\${pkgname}"
  chown root:root -R "\${pkgdir}/opt/zextras/admin/iris/\${pkgname}/${commitHash}"
  chmod 644 -R "\${pkgdir}/opt/zextras/admin/iris/\${pkgname}/${commitHash}"
  find "\${pkgdir}/opt/zextras/admin/iris/\${pkgname}/${commitHash}" -type d -exec chmod a+x "{}" \\;
  ln -sf /opt/zextras/admin/iris/\${pkgname}/i18n "\${pkgdir}/opt/zextras/admin/iris/\${pkgname}/${commitHash}/i18n"
}

postinst() {
  # copy the index.html to the current directory, no redirect is needed
  mkdir -p "/opt/zextras/admin/iris/carbonio-admin-ui/current"

  # not every package has a index.html
  cd "/opt/zextras/admin/iris/carbonio-admin-ui/${commitHash}"
  find . -name "*.html" -exec cp --parents "{}" /opt/zextras/admin/iris/carbonio-admin-ui/current/ \\;

  # re-generate the component list, for every component
  # depth should be 3 since the path should be iris/NAME/COMMIT/component.json
  find /opt/zextras/admin/iris/ \
    -maxdepth 3 \
    -mindepth 3 \
    -type f \
    -name component.json \
    -printf '%T@ %p\n' \
    | sort -rn \
    | awk '{
        n = split($2, path, "/")
        component = path[6]

        if (!seen[component]++) {
            print $2
        }
    }' \
    | xargs jq -s '{"components":.}' >/opt/zextras/admin/iris/components.json
}
`;

fs.writeFileSync(path.resolve(cwd, 'dist', 'PKGBUILD'), pkgbuildContent);
console.log('Generated PKGBUILD');

console.log(`\nBuild completed successfully!`);
console.log(`Output directory: ${distDir}`);
