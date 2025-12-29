#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../../..');
const appsDir = join(rootDir, 'apps');
const packageDir = join(rootDir, 'package/opt/zextras/admin/iris');

/**
 * Generates import map for all admin-ui modules
 * Maps bare module specifiers to their built chunk URLs
 */
export function generateImportMap(commitHash) {
  const adminUiDirs = readdirSync(appsDir).filter(
    (dir) => dir.startsWith('admin-ui-') && dir !== 'admin-ui-bootstrap',
  );

  const imports = {};

  // Add shared dependencies (using CDN for development)
  const sharedLibs = {
    react: 'https://esm.sh/react@19.3.0',
    'react-dom': 'https://esm.sh/react-dom@19.1.0/client',
    'react-i18next': 'https://esm.sh/react-i18next@14.1.3',
    'lodash-es': 'https://esm.sh/lodash-es@4.17.21',
    'react-router-dom': 'https://esm.sh/react-router-dom@6.28.1',
    'styled-components': 'https://esm.sh/styled-components@6.1.15',
    '@emotion/react': 'https://esm.sh/@emotion/react@11.14.0',
    '@emotion/styled': 'https://esm.sh/@emotion/styled@11.14.0',
    i18next: 'https://esm.sh/i18next@24.2.0',
    '@zextras/carbonio-design-system': 'https://esm.sh/@zextras/carbonio-design-system',
  };

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
            mainFile = `../${carbonio.name}/${commitHash}/${files[0]}`;
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
              mainFile = `/static/iris/carbonio-admin-ui-${dir.replace('admin-ui-', '')}/${commitHash}/${files[0]}`;
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
      console.warn(`Warning: Could not process ${dir}:`, error.message);
    }
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
