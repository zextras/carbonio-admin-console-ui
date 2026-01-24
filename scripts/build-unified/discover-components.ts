/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

import { colorLog } from '../utils';

export function discoverComponents(appsDir: string) {
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
        colorLog(`Warning: Could not read package.json for ${dir}, using fallback naming`, 'blue');
        // Fallback pattern for robustness
        target = `carbonio-admin-ui-${dir.replace('admin-ui-', '')}`;
      }
      if (!target) {
        colorLog(`Warning: No carbonio.name found for ${dir}, using fallback naming`, 'blue');
        target = `carbonio-admin-ui-${dir.replace('admin-ui-', '')}`;
      }
      return { name: dir, target };
    });
  return adminUiDirs;
}
