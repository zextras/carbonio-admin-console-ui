/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { OutputOptions, RollupOptions } from 'rollup';

import { colorLog } from '../../../scripts/utils';
import { getSharedDepNames } from './utils';

/**
 * Creates standardized rollup options for the ESM bootstrap application (shell).
 * The shell externalizes shared dependencies - they are loaded via import maps
 * which point to separately built shared-deps bundles.
 * This ensures a single instance of React/styled-components/etc across shell and sub-apps.
 *
 * Sub-apps are imported via static dynamic imports and code-split into separate chunks.
 */
export function createBootstrapRollupOptions(): RollupOptions {
  const output: OutputOptions = {
    entryFileNames: 'shell.mjs',
    chunkFileNames: '[name].[hash].chunk.mjs',
    assetFileNames: (assetInfo) => {
      const fileName = assetInfo.names?.[0] || assetInfo.name || '';
      if (fileName.endsWith('.css')) {
        return '[name].[hash].css';
      }
      return '[name].[hash][extname]';
    },
    inlineDynamicImports: false,
  };

  const sharedExternals = getSharedDepNames();

  colorLog(`Externalizing ${sharedExternals.length} shared dependencies`, 'cyan');
  colorLog(`Externals: ${sharedExternals.join(', ')}`, 'gray');

  return {
    external: sharedExternals,
    output,
  };
}
