#!/usr/bin/env node
/* eslint-disable no-console */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { cpus } from 'os';

function spawnCommand(command: string, args: string[], cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, stdio: 'pipe' });
    let stderr = '';

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || command}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

// Colors for output
const colors = {
  green: '\x1b[0;32m',
  blue: '\x1b[0;34m',
  red: '\x1b[0;31m',
  yellow: '\x1b[0;33m',
  cyan: '\x1b[0;36m',
  reset: '\x1b[0m',
};

function log(message: string, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function useRustOptimizer() {
  const rustBinary = join(
    dirName,
    '..',
    'tools',
    'build-optimizer',
    'target',
    'release',
    'build-optimizer',
  );
  return existsSync(rustBinary) ? rustBinary : null;
}

function isRustInstalled(): boolean {
  try {
    execSync('cargo --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getDefaultJobCount(): number {
  const cpuCount = cpus().length;
  // Use CPU count, but cap at 16 to avoid diminishing returns
  return Math.min(cpuCount, 16);
}

async function main() {
  if (!isRustInstalled()) {
    log('❌ Rust not installed', 'red');
    process.argv.push('--dev');
    return;
  }

  let rustBinary = useRustOptimizer();
  if (!rustBinary) {
    log('⚠️  Rust binary not built. Building with cargo...', 'yellow');
    log('  This may take a minute on first run...', 'blue');
    try {
      execSync('cargo build --release --manifest-path tools/build-optimizer/Cargo.toml', {
        cwd: join(dirName, '..'),
        stdio: 'inherit',
      });
      log('✓ Rust binary built successfully', 'green');
      rustBinary = useRustOptimizer();
    } catch (error) {
      log('❌ Failed to build Rust binary', 'red');
      process.argv.push('--dev');
      return;
    }
  }

  // Parse arguments
  const args = process.argv.slice(2);
  const jobsFlag = args.find((arg) => arg.startsWith('--jobs='));
  const parallelJobs = jobsFlag ? parseInt(jobsFlag.split('=')[1]) : getDefaultJobCount();
  const isAutoDetected = !jobsFlag;

  log('\n🚀 Carbonio Admin Console Build (OPTIMIZED)', 'cyan');
  log('==========================================', 'cyan');
  if (isAutoDetected) {
    log(
      `📦 Parallel jobs: ${parallelJobs} (auto-detected from ${cpus().length} CPU cores)`,
      'blue',
    );
  } else {
    log(`📦 Parallel jobs: ${parallelJobs}`, 'blue');
  }

  // Get git info - batch commands for efficiency
  const gitInfo = execSync('git rev-parse HEAD && git describe --tags --abbrev=0', {
    encoding: 'utf-8',
  })
    .trim()
    .split('\n');
  const commitHash = gitInfo[0];
  const pkgVersion = gitInfo[1].replace(/^v/, '');

  log(`📝 Commit: ${commitHash}`, 'blue');
  log(`📦 Version: ${pkgVersion}`, 'blue');

  log('\n🔍 Discovering components...', 'blue');
  const components: Array<{ name: string; target: string }> = [];

  try {
    const output = execSync(`${rustBinary} discover-components`, { encoding: 'utf-8' });
    const lines = output.trim().split('\n').slice(2); // Skip header lines
    lines.forEach((line) => {
      const match = line.match(/admin-ui-(\w+) -> (.+)/);
      if (match) {
        components.push({ name: `admin-ui-${match[1]}`, target: match[2] });
      }
    });
  } catch (error) {
    log('⚠️  Discovery failed', 'yellow');
  }

  log(`Found ${components.length} components`, 'green');

  // Check git status efficiently
  log('\n🔍 Checking component status...', 'blue');
  const componentsToBuild: string[] = [];

  try {
    const output = execSync(`${rustBinary} git-status`, { encoding: 'utf-8' });
    const lines = output.trim().split('\n');
    lines.forEach((line) => {
      if (line.includes(':')) {
        const [component, status] = line.split(':').map((s) => s.trim());
        if (
          status.includes('CHANGES') ||
          !existsSync(join(dirName, '..', 'apps', component, 'dist', 'source', commitHash))
        ) {
          componentsToBuild.push(component);
        }
      }
    });
  } catch (error) {
    log('⚠️  Git status failed', 'yellow');
    // Fallback: build all
    components.forEach((c) => componentsToBuild.push(c.name));
  }

  if (componentsToBuild.length === 0) {
    log('\n✨ All components are up to date!', 'green');
  } else {
    log(`\n🔨 Building ${componentsToBuild.length} components in parallel...`, 'blue');
    log(`  Building in parallel with ${parallelJobs} jobs`, 'cyan');
    const rootDir = join(dirName, '..');

    // Build only the components that need rebuilding
    const componentsArg = `--components="${componentsToBuild.join(',')}"`;

    try {
      execSync(`${rustBinary} parallel-build --jobs ${parallelJobs} '--dev' ${componentsArg}`, {
        cwd: rootDir,
        stdio: 'inherit',
      });
    } catch (error) {
      log('⚠️ Parallel build failed', 'yellow');
    }
  }

  // Copy components
  log('\n📋 Copying components to package...', 'blue');
  const packageDir = join(dirName, '..', 'package');
  const installDir = join(packageDir, 'opt', 'zextras', 'admin', 'iris');

  const copyPromises = components.map(async (component) => {
    const sourceDir = join(dirName, '..', 'apps', component.name, 'dist', 'source', commitHash);
    const targetDir = join(installDir, component.target);

    if (!existsSync(sourceDir)) {
      throw new Error(`Build artifacts not found for ${component.name}`);
    }

    mkdirSync(targetDir, { recursive: true });

    await spawnCommand(rustBinary as string, [
      'parallel-copy',
      sourceDir,
      targetDir,
      '--jobs',
      String(parallelJobs),
    ]);
  });

  await Promise.all(copyPromises);
  log(`✓ Copied ${components.length} components`, 'green');

  // Create PKGBUILD (same as original)
  log('\n📝 Creating PKGBUILD...', 'blue');
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

  # Set permissions for each component
  for component in ${componentList}; do
    if [ -d "\${pkgdir}/opt/zextras/admin/iris/\${component}" ]; then
      chown -h root:root -R "\${pkgdir}/opt/zextras/admin/iris/\${component}"
      find "\${pkgdir}/opt/zextras/admin/iris/\${component}" -type f -exec chmod 644 {} \\;
      find "\${pkgdir}/opt/zextras/admin/iris/\${component}" -type d -exec chmod 755 {} \\;
    fi
  done
}

preinst() {
  # Remove existing installations
  for dir in carbonio-admin-ui carbonio-admin-console-ui; do
    if [ -d "/opt/zextras/admin/iris/\$dir" ]; then
      rm -rf "/opt/zextras/admin/iris/\$dir"
    fi
  done
}

postinst() {
  commitHash="${commitHash}"

  # Copy index.html files for carbonio-admin-ui
  if [ -d "/opt/zextras/admin/iris/carbonio-admin-ui" ]; then
    mkdir -p "/opt/zextras/admin/iris/carbonio-admin-ui/current"
    for commit_dir in /opt/zextras/admin/iris/carbonio-admin-ui/*; do
      if [ -d "\${commit_dir}" ] && [ "\$(basename "\${commit_dir}")" != "current" ]; then
        cd "\${commit_dir}"
        find . -name "*.html" -exec cp --parents {} /opt/zextras/admin/iris/carbonio-admin-ui/current/ \\; 2>/dev/null || true
        break
      fi
    done
  fi

  # Create i18n symlinks
  for component in ${componentList}; do
    if [ -d "/opt/zextras/admin/iris/\${component}/\${commitHash}" ]; then
      ln -sf /opt/zextras/admin/iris/i18n "/opt/zextras/admin/iris/\${component}/\${commitHash}/i18n"
    fi
  done

  # Generate components.json
  find /opt/zextras/admin/iris/ \\
    -maxdepth 3 \\
    -mindepth 3 \\
    -type f \\
    -name component.json \\
    -printf '%T@ %p\\\\n' \\
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

  writeFileSync(join(packageDir, 'PKGBUILD'), pkgbuildContent);
  log('✓ PKGBUILD created', 'green');

  log('\n📊 Build Summary', 'cyan');
  log('================', 'cyan');
  log(`Total components: ${components.length}`, 'blue');
  log(`Components built: ${componentsToBuild.length}`, 'green');
  log(`Components skipped: ${components.length - componentsToBuild.length}`, 'yellow');
  log('\n=== Build complete! ===', 'green');
}

main().catch((error) => {
  log(`\n❌ Build failed: ${error.message}`, 'red');
  process.exit(1);
});
