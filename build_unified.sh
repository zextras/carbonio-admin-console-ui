#!/bin/bash
#
# SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: GPL-2.0-only
#

set -e # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Building unified admin package ===${NC}"

# Get the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPS_DIR="$ROOT_DIR/apps"
BUILD_DIR="$ROOT_DIR/build"
PACKAGE_DIR="$BUILD_DIR/package"
INSTALL_DIR="$PACKAGE_DIR/opt/zextras/admin/iris"

# Get commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
echo -e "${GREEN}Commit hash: $COMMIT_HASH${NC}"

# Clean up previous build directory
if [ -d "$BUILD_DIR" ]; then
	echo -e "${BLUE}Cleaning previous build directory...${NC}"
	rm -rf "$BUILD_DIR"
fi

# Create directory structure
mkdir -p "$INSTALL_DIR"

# Build and copy admin-ui-bootstrap
echo -e "${BLUE}=== Building admin-ui-bootstrap ===${NC}"
cd "$APPS_DIR/admin-ui-bootstrap"
pnpm build

if [ -d "dist/source" ]; then
	echo -e "${GREEN}Copying admin-ui-bootstrap to package...${NC}"
	mkdir -p "$INSTALL_DIR/carbonio-admin-ui"
	cp -r dist/source/* "$INSTALL_DIR/carbonio-admin-ui/"
else
	echo -e "${RED}Error: No dist/source directory found for admin-ui-bootstrap${NC}"
	exit 1
fi

# Build and copy admin-ui-console
echo -e "${BLUE}=== Building admin-ui-console ===${NC}"
cd "$APPS_DIR/admin-ui-console"
pnpm build

if [ -d "dist/source" ]; then
	echo -e "${GREEN}Copying admin-ui-console to package...${NC}"
	mkdir -p "$INSTALL_DIR/carbonio-admin-console-ui"
	cp -r dist/source/* "$INSTALL_DIR/carbonio-admin-console-ui/"
else
	echo -e "${RED}Error: No dist/source directory found for admin-ui-console${NC}"
	exit 1
fi

# Build and copy admin-ui-cos
echo -e "${BLUE}=== Building admin-ui-cos ===${NC}"
cd "$APPS_DIR/admin-ui-cos"
pnpm build

if [ -d "dist/source" ]; then
	echo -e "${GREEN}Copying admin-ui-cos to package...${NC}"
	mkdir -p "$INSTALL_DIR/carbonio-admin-ui-cos"
	cp -r dist/source/* "$INSTALL_DIR/carbonio-admin-ui-cos/"
else
	echo -e "${RED}Error: No dist/source directory found for admin-ui-cos${NC}"
	exit 1
fi

# Return to root directory
cd "$ROOT_DIR"

# Create PKGBUILD file
echo -e "${BLUE}Creating PKGBUILD...${NC}"
cat >"$PACKAGE_DIR/PKGBUILD" <<'EOF'
# Unified package containing all Carbonio Admin UI components
pkgname="carbonio-admin-ui-unified"
pkgver="1.0.0"
pkgrel="1"
pkgdesc="Carbonio Admin UI"
maintainer="Zextras (packages@zextras.com)"
arch=("x86_64")
license=("AGPL-3.0-only")
copyright=("2025, Zextras &lt;https://www.zextras.com&gt;")
section="admin"
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
  cd "${srcdir}"
  mkdir -p "${pkgdir}/opt/zextras/admin/iris"
  cp -a opt/zextras/admin/iris/* "${pkgdir}/opt/zextras/admin/iris/"
  
  # Set permissions for all components
  for component in carbonio-admin-ui carbonio-admin-console-ui carbonio-admin-ui-cos; do
    if [ -d "${pkgdir}/opt/zextras/admin/iris/${component}" ]; then
      chown root:root -R "${pkgdir}/opt/zextras/admin/iris/${component}"
      find "${pkgdir}/opt/zextras/admin/iris/${component}" -type f -exec chmod 644 "{}" \;
      find "${pkgdir}/opt/zextras/admin/iris/${component}" -type d -exec chmod 755 "{}" \;
    fi
  done
  
  # Create i18n symlinks for each component
  for component in carbonio-admin-ui carbonio-admin-console-ui carbonio-admin-ui-cos; do
    if [ -d "${pkgdir}/opt/zextras/admin/iris/${component}" ]; then
      for commit_dir in "${pkgdir}/opt/zextras/admin/iris/${component}"/*; do
        if [ -d "${commit_dir}" ]; then
          ln -sf /opt/zextras/admin/iris/i18n "${commit_dir}/i18n"
        fi
      done
    fi
  done
}

postinst() {
  # Copy index.html files to current directory for carbonio-admin-ui
  if [ -d "/opt/zextras/admin/iris/carbonio-admin-ui" ]; then
    mkdir -p "/opt/zextras/admin/iris/carbonio-admin-ui/current"
    for commit_dir in /opt/zextras/admin/iris/carbonio-admin-ui/*; do
      if [ -d "${commit_dir}" ] && [ "$(basename ${commit_dir})" != "current" ]; then
        cd "${commit_dir}"
        find . -name "*.html" -exec cp --parents "{}" /opt/zextras/admin/iris/carbonio-admin-ui/current/ \; 2>/dev/null || true
        break  # Only process the first (most recent) commit
      fi
    done
  fi
  
  # Re-generate the component list for all components
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
EOF

echo -e "${GREEN}PKGBUILD created${NC}"

echo -e "${GREEN}=== Build complete! ===${NC}"
echo -e "${GREEN}Package structure created at: $PACKAGE_DIR${NC}"
echo -e "${BLUE}Directory structure:${NC}"
tree -L 4 "$INSTALL_DIR" 2>/dev/null || find "$INSTALL_DIR" -type d | sed 's|[^/]*/|  |g'
