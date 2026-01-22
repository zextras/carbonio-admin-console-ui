/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import { dirname, join } from 'path';

import { generateImportMap } from './generate-import-map';
import { log } from './utils';

function execCommand(command: string, options = {}) {
  try {
    return execSync(command, {
      stdio: 'inherit',
      encoding: 'utf-8',
      ...options,
    });
  } catch (error) {
    log(`Error executing command: ${command} - ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}
export function findWorkspaceRoot(): string {
  let currentDir = process.cwd();

  while (currentDir !== '/') {
    if (existsSync(join(currentDir, 'pnpm-workspace.yaml'))) {
      return currentDir;
    }
    currentDir = dirname(currentDir);
  }

  throw new Error('Could not find workspace root (pnpm-workspace.yaml not found)');
}
function copyRecursive(src: string, dest: string) {
  if (!existsSync(src)) {
    log(`Error: Source directory does not exist: ${src}`, 'red');
    process.exit(1);
  }
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function buildAlreadyExists(componentName: string, commitHash: string, installDir: string) {
  const commitHashDir = join(installDir, componentName, commitHash);
  if (!existsSync(commitHashDir)) {
    return false;
  }
  return true;
}

let gitStatusCache: Map<string, boolean> | null = null;

function getAllGitStatus(): Map<string, boolean> {
  if (gitStatusCache) {
    return gitStatusCache;
  }

  try {
    const result = execSync('git status --porcelain apps/', {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: findWorkspaceRoot(),
    });

    gitStatusCache = new Map();

    const lines = result.trim().split('\n');
    const componentsChanged = new Set<string>();

    for (const line of lines) {
      if (
        line &&
        (line.startsWith('??') ||
          line.startsWith(' M') ||
          line.startsWith('A ') ||
          line.startsWith('D '))
      ) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const filePath = parts[1];
          // Extract component name from path like "apps/admin-ui-xxx/file"
          const match = filePath.match(/^apps\/(admin-ui-[^/]+)/);
          if (match) {
            componentsChanged.add(match[1]);
          }
        }
      }
    }

    // Initialize all known components as false (no changes)
    const rootDir = findWorkspaceRoot();
    const appsDir = join(rootDir, 'apps');
    if (existsSync(appsDir)) {
      const components = readdirSync(appsDir).filter((dir) => dir.startsWith('admin-ui-'));

      components.forEach((comp) => gitStatusCache!.set(comp, componentsChanged.has(comp)));
    }

    return gitStatusCache;
  } catch (error) {
    log(`Error checking git status: ${(error as Error).message}`, 'red');
    return new Map();
  }
}

function hasUncommittedChanges(componentName: string): boolean {
  const statusMap = getAllGitStatus();
  const hasChanges = statusMap.get(componentName) ?? true; // Default to true if not found
  return hasChanges;
}

function getLastTag() {
  return execSync('git describe --tags --abbrev=0', {
    encoding: 'utf-8',
    stdio: 'pipe',
  }).trim();
}

// Dynamically discover all admin-ui components
function discoverComponents(appsDir: string) {
  const adminUiDirs = readdirSync(appsDir)
    .filter((dir) => dir.startsWith('admin-ui-') && statSync(join(appsDir, dir)).isDirectory())
    .map((dir) => {
      // Read target name from package.json carbonio.name field
      const packageJsonPath = join(appsDir, dir, 'package.json');
      let target;
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        target = packageJson.carbonio?.name;
      } catch (error) {
        log(`Warning: Could not read package.json for ${dir}, using fallback naming`, 'blue');
        // Fallback pattern for robustness
        target = `carbonio-admin-ui-${dir.replace('admin-ui-', '')}`;
      }
      if (!target) {
        log(`Warning: No carbonio.name found for ${dir}, using fallback naming`, 'blue');
        target = `carbonio-admin-ui-${dir.replace('admin-ui-', '')}`;
      }
      return { name: dir, target };
    });
  return adminUiDirs;
}

export async function buildUnified() {
  // Get the workspace root directory
  const rootDir = findWorkspaceRoot();
  const appsDir = join(rootDir, 'apps');

  const pkgVersion = getLastTag().replace(/^v/, '');

  log('=== Building unified admin package ===', 'blue');

  // Get commit hash
  const commitHash = execSync('git rev-parse HEAD', {
    encoding: 'utf-8',
  }).trim();

  log(`Commit hash: ${commitHash}`, 'green');

  // Set up installation directories
  const packageDir = join(rootDir, 'package');
  const installDir = join(packageDir, 'opt', 'zextras', 'admin', 'iris');

  const components = discoverComponents(appsDir);

  // Track build statistics
  const buildStats = {
    total: components.length,
    built: 0,
    skipped: 0,
    builtPackages: [] as Array<string>,
  };

  // Ensure bootstrap is built with import map before processing other components
  log('\n=== Ensuring bootstrap is built with import map ===', 'blue');
  const bootstrapDistDir = join(appsDir, 'admin-ui-bootstrap', 'dist', 'source', commitHash);
  const bootstrapIndexHtml = join(bootstrapDistDir, 'index.html');

  // Check if bootstrap needs building (index.html doesn't exist or doesn't have import map)
  let bootstrapNeedsBuild = !existsSync(bootstrapIndexHtml);
  if (!bootstrapNeedsBuild) {
    const indexHtmlContent = readFileSync(bootstrapIndexHtml, 'utf-8');
    if (!indexHtmlContent.includes('importmap')) {
      bootstrapNeedsBuild = true;
    }
  }

  // Build environment with commit hash
  const buildEnv = { ...process.env, COMMIT_HASH: commitHash };

  if (bootstrapNeedsBuild) {
    log('Building bootstrap to generate import map...', 'blue');
    const bootstrapDir = join(appsDir, 'admin-ui-bootstrap');
    process.chdir(bootstrapDir);
    execCommand('pnpm build', { env: buildEnv });
    process.chdir(rootDir);
    log('✅ Bootstrap built successfully', 'green');
  } else {
    log('✅ Bootstrap already built with import map', 'green');
  }

  // Build and copy each component
  components.forEach((component) => {
    log(`=== Processing ${component.name} ===`, 'blue');
    const componentDir = join(appsDir, component.name);
    const distSourceDir = join(componentDir, 'dist', 'source');

    // Check if build already exists for current commit AND if there are uncommitted changes
    const buildExists = buildAlreadyExists(component.target, commitHash, installDir);
    const hasChanges = hasUncommittedChanges(component.name);

    if (buildExists && !hasChanges) {
      log(
        `⚡ Skipping ${component.name} - build already exists for ${commitHash} and no uncommitted changes`,
        'green',
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

      // Clean up previous package directory for the specific component
      log('Cleaning previous package directory...', 'blue');
      const componentInstallDir = join(installDir, component.target);
      rmSync(componentInstallDir, { recursive: true, force: true });

      const buildCommand = 'pnpm build';
      execCommand(buildCommand, { env: buildEnv });
      buildStats.built++;
      buildStats.builtPackages.push(component.name);

      const commitHashDir = join(distSourceDir, commitHash);
      if (!existsSync(commitHashDir)) {
        log(`Error: No dist/source/${commitHash} directory found for ${component.name}`, 'red');
        process.exit(1);
      }

      // Copy to package (regardless of whether it was just built or already existed)
      log(`Copying ${component.name} to package...`, 'green');
      const targetDir = join(installDir, component.target);
      mkdirSync(targetDir, { recursive: true });
      copyRecursive(distSourceDir, targetDir);
    }
  });

  process.chdir(rootDir);

  log('\n=== Regenerating import map with all modules ===', 'blue');
  const importMap = generateImportMap(commitHash);
  log(`✅ Import map generated with ${Object.keys(importMap.imports).length} entries`, 'green');

  const bootstrapVersionedDir = join(installDir, 'carbonio-admin-ui', commitHash);
  const htmlPath = join(bootstrapVersionedDir, 'index.html');
  const importMapJsonPath = join(bootstrapVersionedDir, 'import-map.json');

  // Write the import-map.json file
  writeFileSync(importMapJsonPath, JSON.stringify(importMap, null, 2));
  log('✅ import-map.json updated', 'green');

  if (existsSync(htmlPath)) {
    let html = readFileSync(htmlPath, 'utf-8');
    const scriptTag = `<script type="importmap">${JSON.stringify(importMap, null, 2)}</script>`;

    const importMapStart = html.indexOf('<script type="importmap">');
    if (importMapStart !== -1) {
      const importMapEnd = html.indexOf('</script>', importMapStart) + '</script>'.length;
      html = html.substring(0, importMapStart) + scriptTag + html.substring(importMapEnd);
    } else {
      const shellScriptStart = html.indexOf('<script type="module"');
      html =
        html.substring(0, shellScriptStart) + scriptTag + '\n  ' + html.substring(shellScriptStart);
    }

    writeFileSync(htmlPath, html);
    log('✅ Bootstrap index.html updated', 'green');
  }

  // Verify shared dependencies exist (they're built directly to the package dir by build-shell)
  log('\n=== Verifying shared dependencies ===', 'blue');
  const sharedDepsDir = join(installDir, 'shared-dependencies', commitHash);

  if (existsSync(sharedDepsDir)) {
    log('✅ Shared dependencies found', 'green');
  } else {
    log('⚠️  Shared dependencies not found - they should have been built by bootstrap', 'yellow');
  }

  log('\n=== Copying bootstrap index.html to current directory ===', 'blue');
  const bootstrapCurrentDir = join(installDir, 'carbonio-admin-ui', 'current');

  if (existsSync(bootstrapVersionedDir)) {
    mkdirSync(bootstrapCurrentDir, { recursive: true });
    const indexHtmlSource = join(bootstrapVersionedDir, 'index.html');
    if (existsSync(indexHtmlSource)) {
      const indexHtmlDest = join(bootstrapCurrentDir, 'index.html');
      copyFileSync(indexHtmlSource, indexHtmlDest);
      log('✅ Copied index.html to current directory', 'green');
    }
  }

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
}
`;

  writeFileSync(join(packageDir, 'PKGBUILD'), pkgbuildContent);
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
