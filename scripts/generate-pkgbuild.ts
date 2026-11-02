/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { execSync } from 'child_process';
import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { colorLog, getWorkspaceRoot } from './utils';

function getLastTag(): string {
  try {
    return execSync('git describe --tags --abbrev=0', {
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();
  } catch {
    return 'v0.0.0';
  }
}

const main = (): void => {
  const rootDir = getWorkspaceRoot();
  const distDir = join(rootDir, 'dist');
  const pkgVersion = getLastTag().replace(/^v/, '');
  const appsDir = join(distDir, 'package', 'opt', 'zextras', 'admin', 'iris');
  const componentList = readdirSync(appsDir).join(' ');

  colorLog('Creating PKGBUILD...', 'blue');

  const pkgbuildContent = `# Unified package containing all Carbonio Admin UI components
pkgname="carbonio-admin-console-ui"
pkgver="${pkgVersion}"
pkgrel="1"
pkgdesc="Carbonio Admin UI"
maintainer="Zextras (packages@zextras.com)"
arch=("any")
license=("AGPL-3.0-only")
copyright=("2025, Zextras <https://www.zextras.com>")
section="admin"
conflicts=('carbonio-admin-ui')
provides=('carbonio-admin-ui')
priority="optional"
url="https://github.com/zextras"
depends=(
  "carbonio-nginx"
  "carbonio-webui-i18n"
  "jq"
)
source=(
  "\${pkgname}-dist.tar.gz"
)
sha256sums=(
  "SKIP"
)

package() {
  mkdir -p "\${pkgdir}/opt/zextras/admin/iris"
  cp -a "\${srcdir}/dist/package/opt/zextras/admin/iris/"* "\${pkgdir}/opt/zextras/admin/iris/"

  # Set permissions for each component - files and directories only, symlinks are left as-is
  for component in ${componentList}; do
    if [ -d "\${pkgdir}/opt/zextras/admin/iris/\${component}" ]; then
      chown -h root:root -R "\${pkgdir}/opt/zextras/admin/iris/\${component}"
      # Only chmod regular files, not symlinks
      find "\${pkgdir}/opt/zextras/admin/iris/\${component}" -type f -exec chmod 644 {} \\;
      # Make directories executable
      find "\${pkgdir}/opt/zextras/admin/iris/\${component}" -type d -exec chmod 755 {} \\;
    fi
  done
}

preinst() {
  # Remove existing installations before installing new package
  if [ -d "/opt/zextras/admin/iris/carbonio-admin-ui" ]; then
    rm -rf "/opt/zextras/admin/iris/carbonio-admin-ui"
  fi
  if [ -d "/opt/zextras/admin/iris/carbonio-admin-console-ui" ]; then
    rm -rf "/opt/zextras/admin/iris/carbonio-admin-console-ui"
  fi
}

postinst() {
  # Create i18n symlinks for all components
  # Using POSIX-compatible loop (no bash arrays)
  for component in ${componentList}; do
    if [ -d "/opt/zextras/admin/iris/\${component}" ]; then
      ln -sf /opt/zextras/admin/iris/i18n "/opt/zextras/admin/iris/\${component}/i18n"
      ln -sf /opt/zextras/.version "/opt/zextras/admin/iris/\${component}/.version"
    fi
  done
}
`;

  writeFileSync(join(distDir, 'package', 'PKGBUILD'), pkgbuildContent);

  colorLog('PKGBUILD created', 'green');
};

main();
