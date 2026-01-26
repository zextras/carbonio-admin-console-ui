/* eslint-disable no-console */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { getSharedDependencyPaths } from './utils';

/**
 * Find the workspace root by looking for pnpm-workspace.yaml
 */
function findWorkspaceRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== '/') {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  // Fallback to startDir if we can't find workspace root
  return startDir;
}

const cwd = process.cwd();
const rootDir = findWorkspaceRoot(cwd);
const appsDir = join(rootDir, 'apps');
const packageDir = join(rootDir, 'package/opt/zextras/admin/iris');

/**
 * Generates import map for all admin-ui modules
 * Maps bare module specifiers to their built chunk URLs
 */
export function generateImportMap(commitHash: string) {
  const adminUiDirs = readdirSync(appsDir).filter(
    (dir) => dir.startsWith('admin-ui-') && dir !== 'admin-ui-bootstrap',
  );

  const imports: Record<string, string> = {};

  // Get shared dependency local paths from package.json versions
  const sharedLibs = getSharedDependencyPaths(commitHash);

  for (const dir of adminUiDirs) {
    const packageJsonPath = join(appsDir, dir, 'package.json');
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const carbonio = packageJson.carbonio;

      if (carbonio && carbonio.type === 'carbonioAdmin') {
        const packageName = packageJson.name;
        let mainFile = null;

        // Try unified package directory first (for unified builds)
        const unifiedDistDir = join(packageDir, carbonio.name, commitHash);
        try {
          const files = readdirSync(unifiedDistDir).filter(
            (f) => f.startsWith('app.') && f.endsWith('.mjs') && !f.includes('.chunk.'),
          );
          if (files.length > 0) {
            mainFile = `/static/iris/${carbonio.name}/${commitHash}/${files[0]}`;
          }
        } catch {
          // Unified package directory doesn't exist, try individual app dist
          const appDistDir = join(appsDir, dir, 'dist/source', commitHash);
          try {
            const files = readdirSync(appDistDir).filter(
              (f) => f.startsWith('app.') && f.endsWith('.mjs') && !f.includes('.chunk.'),
            );
            if (files.length > 0) {
              // For individual app builds, use absolute path from bootstrap dist
              mainFile = `/static/iris/carbonio-admin-ui-${dir.replace(
                'admin-ui-',
                '',
              )}/${commitHash}/${files[0]}`;
            }
          } catch {
            // Individual app dist doesn't exist either, skip
          }
        }

        if (mainFile) {
          imports[packageName] = mainFile;
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not process ${dir}:`, (error as Error).message);
    }
  }

  // Special handling for admin-ui-bootstrap
  const bootstrapDir = join(appsDir, 'admin-ui-bootstrap');
  const bootstrapPackageJsonPath = join(bootstrapDir, 'package.json');

  try {
    const bootstrapPackageJson = JSON.parse(readFileSync(bootstrapPackageJsonPath, 'utf8'));
    const bootstrapCarbonio = bootstrapPackageJson.carbonio;

    if (bootstrapCarbonio && bootstrapCarbonio.type === 'shell') {
      const bootstrapPackageName = bootstrapPackageJson.name;
      let shellFile = null;

      // Try unified package directory first (for unified builds)
      const unifiedDistDir = join(packageDir, bootstrapCarbonio.name, commitHash);
      let found = false;

      try {
        const bootstrapFiles = readdirSync(unifiedDistDir).filter(
          (f) => f.startsWith('bootstrap-exports.') && f.endsWith('.mjs'),
        );
        // Prefer hashed filenames (bootstrap-exports.[hash].mjs) over unhashed (bootstrap-exports.mjs)
        const hashedFiles = bootstrapFiles.filter((f) => f !== 'bootstrap-exports.mjs');
        const files = hashedFiles.length > 0 ? hashedFiles : bootstrapFiles;
        if (files.length > 0) {
          shellFile = `/static/iris/${bootstrapCarbonio.name}/${commitHash}/${files[0]}`;
          found = true;
        }
      } catch {
        // Unified package directory doesn't exist, continue to individual app dist
      }

      // If not found in unified directory, try individual app dist
      if (!found) {
        const appDistDir = join(appsDir, 'admin-ui-bootstrap', 'dist/source', commitHash);
        try {
          const bootstrapFiles = readdirSync(appDistDir).filter(
            (f) => f.startsWith('bootstrap-exports.') && f.endsWith('.mjs'),
          );
          // Prefer hashed filenames (bootstrap-exports.[hash].mjs) over unhashed (bootstrap-exports.mjs)
          const hashedFiles = bootstrapFiles.filter((f) => f !== 'bootstrap-exports.mjs');
          const files = hashedFiles.length > 0 ? hashedFiles : bootstrapFiles;
          if (files.length > 0) {
            shellFile = `/static/iris/${bootstrapCarbonio.name}/${commitHash}/${files[0]}`;
          }
        } catch {
          // Bootstrap dist doesn't exist, skip
        }
      }

      if (shellFile) {
        imports[bootstrapPackageName] = shellFile;
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not process admin-ui-bootstrap:`, (error as Error).message);
  }

  return {
    imports: {
      ...sharedLibs,
      ...imports,
    },
  };
}

// Main execution - only run when executed directly (not when imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const commitHash = args[0] || process.env.COMMIT_HASH;

  if (!commitHash) {
    console.error('Error: COMMIT_HASH must be provided');
    process.exit(1);
  }

  const importMap = generateImportMap(commitHash);

  // Write to stdout for pipe to file, or to file if output path provided
  const outputPath = args[1];
  if (outputPath) {
    writeFileSync(outputPath, JSON.stringify(importMap, null, 2));
    console.log(`Import map written to ${outputPath}`);
  } else {
    console.log(JSON.stringify(importMap, null, 2));
  }
}
