 
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { colorLog, getSharedDependencyPaths,getWorkspaceRoot } from './utils';

const cwd = process.cwd();
const rootDir = getWorkspaceRoot(cwd);
const appsDir = join(rootDir, 'apps');

function buildArtifacUrl(carbonioName: string, commitHash: string): string {
  return `/static/iris/${carbonioName}/${commitHash}/index.mjs`;
}

function getModuleEntry(dir: string, commitHash: string): [string, string] | null {
  try {
    const packageJsonPath = join(appsDir, dir, 'package.json');
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    if (!pkg.carbonio?.name) return null;

    return [pkg.name, buildArtifacUrl(pkg.carbonio.name, commitHash)];
  } catch (error) {
    colorLog(`⚠️  Failed to read package.json for ${dir}: ${(error as Error).message}`, 'yellow');
    return null;
  }
}

/**
 * Generates import map for all admin-ui modules
 * Maps bare module specifiers to their built chunk URLs
 */
export function generateImportMap(commitHash: string) {
  const moduleEntries = readdirSync(appsDir)
    .filter((dir) => dir.startsWith('admin-ui-'))
    .map((dir) => getModuleEntry(dir, commitHash))
    .filter((entry): entry is [string, string] => entry !== null);

  return {
    imports: {
      ...getSharedDependencyPaths(commitHash),
      ...Object.fromEntries(moduleEntries),
    },
  };
}
