/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

import { colorLog, copyRecursive, execCommand } from '../utils';
import { getAllGitStatus } from './get-all-git-status';
import { Component } from './types';

function buildAlreadyExists(componentName: string, commitHash: string, installDir: string) {
  const commitHashDir = join(installDir, componentName, commitHash);
  if (!existsSync(commitHashDir)) {
    return false;
  }
  return true;
}

function hasUncommittedChanges(componentName: string): boolean {
  const statusMap = getAllGitStatus();
  const hasChanges = statusMap.get(componentName) ?? true; // Default to true if not found
  return hasChanges;
}

export async function buildApps(
  components: Array<Component>,
  installDir: string,
  appsDir: string,
  commitHash: string,
): Promise<void> {
  components.forEach((component) => {
    colorLog(`=== Processing ${component.name} ===`, 'blue');
    const componentDir = join(appsDir, component.name);
    const distSourceDir = join(componentDir, 'dist', 'source');

    // Check if build already exists for current commit AND if there are uncommitted changes
    const buildExists = buildAlreadyExists(component.target, commitHash, installDir);
    const hasChanges = hasUncommittedChanges(component.name);

    if (buildExists && !hasChanges) {
      colorLog(
        `⚡ Skipping ${component.name} - build already exists for ${commitHash} and no uncommitted changes`,
        'green',
      );
    } else {
      // Explain why we need to build
      if (!buildExists) {
        colorLog(`🔨 Building ${component.name} - no existing build for ${commitHash}`, 'blue');
      }
      if (hasChanges) {
        colorLog(`🔨 Building ${component.name} - uncommitted changes detected`, 'blue');
      }

      process.chdir(componentDir);

      // Clean up previous package directory for the specific component
      colorLog('Cleaning previous package directory...', 'blue');
      const componentInstallDir = join(installDir, component.target);
      rmSync(componentInstallDir, { recursive: true, force: true });

      const buildEnv = { ...process.env, COMMIT_HASH: commitHash };
      const buildCommand = 'pnpm build';
      execCommand(buildCommand, { env: buildEnv });

      const commitHashDir = join(distSourceDir, commitHash);
      if (!existsSync(commitHashDir)) {
        colorLog(
          `Error: No dist/source/${commitHash} directory found for ${component.name}`,
          'red',
        );
        process.exit(1);
      }

      // Copy to package (regardless of whether it was just built or already existed)
      colorLog(`Copying ${component.name} to package...`, 'green');
      const targetDir = join(installDir, component.target);
      mkdirSync(targetDir, { recursive: true });
      copyRecursive(distSourceDir, targetDir);
    }
  });
}
