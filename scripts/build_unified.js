#!/usr/bin/env node
/* eslint-disable no-console */

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
		log(`Error executing command: ${command} - ${error.message}`, 'red');
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

function isBuildAlreadyExists(componentName, commitHash) {
	const componentDir = path.join(__dirname, '..', 'apps', componentName);
	const commitHashDir = path.join(componentDir, 'dist', 'source', commitHash);

	if (!fs.existsSync(commitHashDir)) {
		return false;
	}

	// Validate build completeness by checking for required files
	const requiredFiles = ['component.json'];
	let jsFiles = [];

	try {
		jsFiles = fs
			.readdirSync(commitHashDir)
			.filter((f) => f.startsWith('app.') && f.endsWith('.js'));
	} catch (error) {
		console.error(error);
		return false;
	}

	if (jsFiles.length === 0) {
		return false;
	}

	for (const file of requiredFiles) {
		if (!fs.existsSync(path.join(commitHashDir, file))) {
			return false;
		}
	}

	return true;
}

function hasUncommittedChanges(componentName) {
	try {
		// Check if there are any uncommitted changes in the app directory
		const result = execSync('git status --porcelain apps/' + componentName, {
			encoding: 'utf-8',
			stdio: 'pipe'
		});
		// If result is not empty, there are changes
		return result.trim().length > 0;
	} catch (error) {
		log(`Error checking git status for ${componentName}: ${error.message}`, 'red');
		return true;
	}
}

function main() {
	// Parse command line arguments
	const args = process.argv.slice(2);
	const isDevMode = args.includes('--dev');

	// Get the root directory
	const rootDir = path.join(__dirname, '..');
	const appsDir = path.join(rootDir, 'apps');
	const buildDir = path.join(rootDir, 'dist');

	function getLastTag() {
		return execSync('git describe --tags --abbrev=0', {
			encoding: 'utf-8',
			stdio: 'pipe'
		}).trim();
	}

	const pkgVersion = getLastTag().replace(/^v/, '');

	log('=== Building unified admin package ===', 'blue');

	// Get commit hash
	const commitHash = execSync('git rev-parse HEAD', {
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

	// Dynamically discover all admin-ui components
	function discoverComponents() {
		const adminUiDirs = fs
			.readdirSync(appsDir)
			.filter(
				(dir) => dir.startsWith('admin-ui-') && fs.statSync(path.join(appsDir, dir)).isDirectory()
			)
			.map((dir) => {
				// Read target name from package.json carbonio.name field
				const packageJsonPath = path.join(appsDir, dir, 'package.json');
				let target;
				try {
					const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
					target = packageJson.carbonio?.name;
					// eslint-disable-next-line no-unused-vars
				} catch (error) {
					log(`Warning: Could not read package.json for ${dir}, using fallback naming`, 'blue');
					// Fallback pattern for robustness
					target =
						dir === 'admin-ui-console'
							? 'carbonio-admin-console-ui'
							: `carbonio-admin-ui-${dir.replace('admin-ui-', '')}`;
				}
				if (!target) {
					log(`Warning: No carbonio.name found for ${dir}, using fallback naming`, 'blue');
					target =
						dir === 'admin-ui-console'
							? 'carbonio-admin-console-ui'
							: `carbonio-admin-ui-${dir.replace('admin-ui-', '')}`;
				}
				return { name: dir, target };
			});
		return adminUiDirs;
	}

	const components = discoverComponents();

	// Track build statistics
	const buildStats = {
		total: components.length,
		built: 0,
		skipped: 0,
		builtPackages: []
	};

	// Build and copy each component
	for (const component of components) {
		log(`=== Processing ${component.name} ===`, 'blue');
		const componentDir = path.join(appsDir, component.name);
		const distSourceDir = path.join(componentDir, 'dist', 'source');

		// Check if build already exists for current commit AND if there are uncommitted changes
		const buildExists = isBuildAlreadyExists(component.name, commitHash);
		const hasChanges = hasUncommittedChanges(component.name);

		if (buildExists && !hasChanges) {
			log(
				`⚡ Skipping ${component.name} - build already exists for ${commitHash} and no uncommitted changes`,
				'green'
			);
			buildStats.skipped++;
		} else {
			// Explain why we need to build
			if (!buildExists) {
				log(`🔨 Building ${component.name} - no existing build for ${commitHash}`, 'blue');
			}
			if (hasChanges) {
				log(`🔨 Building ${component.name} - uncommitted changes detected`, 'blue');
			}

			process.chdir(componentDir);
			const buildCommand = isDevMode ? 'pnpm build:dev' : 'pnpm build';
			execCommand(buildCommand);
			buildStats.built++;
			buildStats.builtPackages.push(component.name);

			const commitHashDir = path.join(distSourceDir, commitHash);
			if (!fs.existsSync(commitHashDir)) {
				log(`Error: No dist/source/${commitHash} directory found for ${component.name}`, 'red');
				process.exit(1);
			}
		}

		// Copy to package (regardless of whether it was just built or already existed)
		log(`Copying ${component.name} to package...`, 'green');
		const targetDir = path.join(installDir, component.target);
		fs.mkdirSync(targetDir, { recursive: true });
		copyRecursive(path.join(distSourceDir, commitHash), targetDir);
	}

	// Return to root directory
	process.chdir(rootDir);

	// Create PKGBUILD file
	log('Creating PKGBUILD...', 'blue');

	// Generate dynamic component list for PKGBUILD (space-separated for bash array)
	const componentList = components.map((c) => c.target).join(' ');

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
    | xargs jq -s '{"components":.}' > /opt/zextras/admin/iris/components.json
}
`;

	fs.writeFileSync(path.join(packageDir, 'PKGBUILD'), pkgbuildContent);
	log('PKGBUILD created', 'green');

	// Print build summary
	log('\n📊 Build Summary:', 'blue');
	log(`   Total components: ${buildStats.total}`, 'blue');
	log(`   Built: ${buildStats.built}`, 'green');
	log(`   Skipped: ${buildStats.skipped}`, 'green');

	// List the packages that were built
	if (buildStats.builtPackages.length > 0) {
		log(`   Built packages:`, 'blue');
		buildStats.builtPackages.forEach((packageName) => {
			log(`     • ${packageName}`, 'green');
		});
	}


	log('=== Build complete! ===', 'green');
}

main();
