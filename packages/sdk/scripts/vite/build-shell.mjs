#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cwd = process.cwd();
const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();

console.log('Building shell in production mode');
console.log(`Commit hash: ${commitHash}`);

// Build with Vite
await build({
	configFile: path.resolve(cwd, 'vite.config.ts'),
	mode: 'production'
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

const componentJson = {
	name: 'carbonio-admin-ui',
	js_entrypoint: `/static/iris/carbonio-admin-ui/${commitHash}/zapp-admin-ui.bundle.js`,
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
const pkgbuildContent = `# This package contains the shell for carbonio admin ui

pkgname="carbonio-admin-ui"
pkgver="${packageJson.version}"
pkgrel="1"
pkgdesc="${packageJson.description || 'Carbonio Admin UI Shell'}"
maintainer="Zextras (packages@zextras.com)"
arch=("x86_64")
license=("AGPL-3.0-only")
copyright=("2022, Zextras &lt;https://www.zextras.com&gt;")
section="admin"
priority="optional"
url="https://github.com/zextras"
depends=(
  "carbonio-nginx"
  "jq"
)

source=('dist')
sha256sums=('SKIP')

package() {
  cd "\${srcdir}"
  mkdir -p "\${pkgdir}/opt/zextras/admin/iris/carbonio-admin-ui"
  cp -a dist/* "\${pkgdir}/opt/zextras/admin/iris/carbonio-admin-ui"
  chown root:root -R "\${pkgdir}/opt/zextras/admin/iris/carbonio-admin-ui/${commitHash}"
  chmod 644 -R "\${pkgdir}/opt/zextras/admin/iris/carbonio-admin-ui/${commitHash}"
  find "\${pkgdir}/opt/zextras/admin/iris/carbonio-admin-ui/${commitHash}" -type d -exec chmod a+x "{}" \\;
}

postinst() {
  # re-generate the component list
  find /opt/zextras/admin/iris/ \\
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
    | xargs jq -s '{"components":.}' >/opt/zextras/admin/iris/components.json
}
`;

fs.writeFileSync(path.resolve(cwd, 'dist', 'PKGBUILD'), pkgbuildContent);
console.log('Generated PKGBUILD');

console.log(`\nBuild completed successfully!`);
console.log(`Output directory: ${distDir}`);
