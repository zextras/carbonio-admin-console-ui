/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

import { colorLog, findWorkspaceRoot } from '../utils';

let gitStatusCache: Map<string, boolean> | null = null;

export function getAllGitStatus(): Map<string, boolean> {
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
    colorLog(`Error checking git status: ${(error as Error).message}`, 'red');
    return new Map();
  }
}
