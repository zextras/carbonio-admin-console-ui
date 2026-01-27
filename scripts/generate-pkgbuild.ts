/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { colorLog, getWorkspaceRoot, getCommitHash } from '../utils';

export const genratePkgbuild = (pkgVersion: string): void => {
  const rootDir = getWorkspaceRoot();
  const commitHash = getCommitHash();
  const packageDir = join(rootDir, 'package');
  const appsDir = join(packageDir, 'opt', 'zextras', 'admin', 'iris');
  const componentList = readdirSync(appsDir);

  colorLog('Creating PKGBUILD...', 'blue');

  const pkgbuildContent = `# Unified package containing all Carbonio Admin UI components
pkgname="carbonio-admin-console-ui"
pkgver="${pkgVersion}"
pkgrel="1"
pkgdesc="Carbonio Admin UI"
maintainer="Zextras (packages@zextras.com)"
arch=("x86_64")
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
source=('opt')
sha256sums=('SKIP')

package() {
  cd "\${srcdir}"
  mkdir -p "\${pkgdir}/opt/zextras/admin/iris"
  cp -a opt/zextras/admin/iris/* "\${pkgdir}/opt/zextras/admin/iris/"

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
  # Define commit hash (injected at build time)
  commitHash="${commitHash}"

  # Copy index.html files to current directory for carbonio-admin-ui
  if [ -d "/opt/zextras/admin/iris/carbonio-admin-ui" ]; then
    mkdir -p "/opt/zextras/admin/iris/carbonio-admin-ui/current"
    for commit_dir in /opt/zextras/admin/iris/carbonio-admin-ui/*; do
      if [ -d "\${commit_dir}" ] && [ "\\$(basename "\${commit_dir}")" != "current" ]; then
        cd "\${commit_dir}"
        find . -name "*.html" -exec cp --parents {} /opt/zextras/admin/iris/carbonio-admin-ui/current/ \\; 2>/dev/null || true
        break  # Only process the first (most recent) commit
      fi
    done
  fi

  # Create i18n symlinks for all components with specific commit hash
  # Using POSIX-compatible loop (no bash arrays)
  for component in ${componentList}; do
    if [ -d "/opt/zextras/admin/iris/\${component}/\${commitHash}" ]; then
      ln -sf /opt/zextras/admin/iris/i18n "/opt/zextras/admin/iris/\${component}/\${commitHash}/i18n"
    fi
  done
}
`;

  writeFileSync(join(packageDir, 'PKGBUILD'), pkgbuildContent);

  colorLog('PKGBUILD created', 'green');
};
