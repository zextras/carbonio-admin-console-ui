#!/usr/bin/env node
//
// SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: GPL-2.0-only
//

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
	green: '\x1b[0;32m',
	blue: '\x1b[0;34m',
	red: '\x1b[0;31m',
	reset: '\x1b[0m'
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
	try {
		return execSync(command, {
			stdio: 'inherit',
			encoding: 'utf-8',
			...options
		});
	} catch (error) {
		log(`Error executing command: ${command}`, 'red');
		process.exit(1);
	}
}

function copyRecursive(src, dest) {
	if (!fs.existsSync(src)) {
		log(`Error: Source directory does not exist: ${src}`, 'red');
		process.exit(1);
	}

	fs.mkdirSync(dest, { recursive: true });

	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			copyRecursive(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

function main() {
	// Get the root directory
	const rootDir = __dirname;
	const appsDir = path.join(rootDir, 'apps');
	const buildDir = path.join(rootDir, 'dist');

	// Read package version
	const consolePackageJson = JSON.parse(
		fs.readFileSync(path.join(appsDir, 'admin-ui-console', 'package.json'), 'utf-8')
	);
	const pkgVersion = consolePackageJson.version;

	log('=== Building unified admin package ===', 'blue');

	// Get commit hash
	const commitHash = execSync('git rev-parse --short HEAD', {
		encoding: 'utf-8'
	}).trim();
	log(`Commit hash: ${commitHash}`, 'green');

	// Set up installation directories
	const packageDir = path.join(rootDir, 'package');
	const installDir = path.join(packageDir, 'opt', 'zextras', 'admin', 'iris');

	// Clean up previous build directory
	if (fs.existsSync(buildDir)) {
		log('Cleaning previous build directory...', 'blue');
		fs.rmSync(buildDir, { recursive: true, force: true });
	}

	// Clean up previous package directory
	if (fs.existsSync(packageDir)) {
		log('Cleaning previous package directory...', 'blue');
		fs.rmSync(packageDir, { recursive: true, force: true });
	}

	const components = [
		{ name: 'admin-ui-bootstrap', target: 'carbonio-admin-ui' },
		{ name: 'admin-ui-console', target: 'carbonio-admin-console-ui' },
		{ name: 'admin-ui-cos', target: 'carbonio-admin-ui-cos' }
	];

	// Build and copy each component
	for (const component of components) {
		log(`=== Building ${component.name} ===`, 'blue');

		const componentDir = path.join(appsDir, component.name);
		process.chdir(componentDir);

		execCommand('pnpm build');

		const distSourceDir = path.join(componentDir, 'dist', 'source');

		if (fs.existsSync(distSourceDir)) {
			log(`Copying ${component.name} to package...`, 'green');
			const targetDir = path.join(installDir, component.target);
			fs.mkdirSync(targetDir, { recursive: true });
			copyRecursive(distSourceDir, targetDir);
		} else {
			log(`Error: No dist/source directory found for ${component.name}`, 'red');
			process.exit(1);
		}
	}

	// Return to root directory
	process.chdir(rootDir);

	// Create PKGBUILD file
	log('Creating PKGBUILD...', 'blue');

	const pkgbuildContent = `# Unified package containing all Carbonio Admin UI components
pkgname="carbonio-admin-console-ui"
pkgver="${pkgVersion}"
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
  cd "\${srcdir}"
  mkdir -p "\${pkgdir}/opt/zextras/admin/iris"
  cp -a opt/zextras/admin/iris/* "\${pkgdir}/opt/zextras/admin/iris/"
  
  # Set permissions for each component - files and directories only, symlinks are left as-is
  for component in carbonio-admin-ui carbonio-admin-console-ui carbonio-admin-ui-cos; do
    if [ -d "\${pkgdir}/opt/zextras/admin/iris/\${component}" ]; then
      chown -h root:root -R "\${pkgdir}/opt/zextras/admin/iris/\${component}"
      # Only chmod regular files, not symlinks
      find "\${pkgdir}/opt/zextras/admin/iris/\${component}" -type f -exec chmod 644 "{}" \\;
      # Make directories executable
      find "\${pkgdir}/opt/zextras/admin/iris/\${component}" -type d -exec chmod 755 "{}" \\;
    fi
  done
  
  # Create i18n symlinks for each component AFTER permissions are set
  for component in carbonio-admin-ui carbonio-admin-console-ui carbonio-admin-ui-cos; do
    if [ -d "\${pkgdir}/opt/zextras/admin/iris/\${component}" ]; then
      for commit_dir in "\${pkgdir}/opt/zextras/admin/iris/\${component}"/*; do
        if [ -d "\${commit_dir}" ]; then
          ln -sf /opt/zextras/admin/iris/i18n "\${commit_dir}/i18n"
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
      if [ -d "\${commit_dir}" ] && [ "$(basename \${commit_dir})" != "current" ]; then
        cd "\${commit_dir}"
        find . -name "*.html" -exec cp --parents "{}" /opt/zextras/admin/iris/carbonio-admin-ui/current/ \\; 2>/dev/null || true
        break  # Only process the first (most recent) commit
      fi
    done
  fi
  
  # Re-generate the component list for all components
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

	fs.writeFileSync(path.join(packageDir, 'PKGBUILD'), pkgbuildContent);
	log('PKGBUILD created', 'green');

	log('=== Build complete! ===', 'green');
	log(`Package structure created at: ${packageDir}`, 'green');
	log('Directory structure:', 'blue');

	// Try to show directory tree
	try {
		execSync(`tree -L 4 "${installDir}"`, { stdio: 'inherit' });
	} catch {
		// Fallback if tree is not installed
		try {
			const output = execSync(`find "${installDir}" -type d`, { encoding: 'utf-8' });
			const dirs = output.trim().split('\n');
			for (const dir of dirs) {
				const depth = dir.split('/').length - installDir.split('/').length;
				console.log('  '.repeat(depth) + path.basename(dir));
			}
		} catch (error) {
			log('Could not display directory structure', 'red');
		}
	}
}

// Run the script
main();
