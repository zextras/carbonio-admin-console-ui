/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { generateImportMap } from '../generate-import-map';
import { colorLog } from '../utils';

export function regenerateImportMap(commitHash: string, installDir: string) {
  colorLog('\n=== Regenerating import map with all modules ===', 'blue');
  const importMap = generateImportMap(commitHash);
  colorLog(
    `✅ Import map generated with ${Object.keys(importMap.imports).length} entries`,
    'green',
  );

  const bootstrapVersionedDir = join(installDir, 'carbonio-admin-ui', commitHash);
  const htmlPath = join(bootstrapVersionedDir, 'index.html');
  const importMapJsonPath = join(bootstrapVersionedDir, 'import-map.json');

  writeFileSync(importMapJsonPath, JSON.stringify(importMap, null, 2));
  colorLog('✅ import-map.json updated', 'green');

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
    colorLog('✅ Bootstrap index.html updated', 'green');
  }
}
