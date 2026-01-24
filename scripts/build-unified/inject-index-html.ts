/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { colorLog } from '../utils';

export function injectIndexHtml(installDir: string, commitHash: string) {
  colorLog('\n=== Copying bootstrap index.html to current directory ===', 'blue');
  const bootstrapCurrentDir = join(installDir, 'carbonio-admin-ui', 'current');

  const bootstrapVersionedDir = join(installDir, 'carbonio-admin-ui', commitHash);
  if (existsSync(bootstrapVersionedDir)) {
    mkdirSync(bootstrapCurrentDir, { recursive: true });
    const indexHtmlSource = join(bootstrapVersionedDir, 'index.html');
    if (existsSync(indexHtmlSource)) {
      const indexHtmlDest = join(bootstrapCurrentDir, 'index.html');
      copyFileSync(indexHtmlSource, indexHtmlDest);
      colorLog('✅ Copied index.html to current directory', 'green');
    }
  }
}
