/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { colorLog, getSharedDepNames } from './utils';
import type { BuildOptions } from 'vite';

export function createBootstrapRollupOptions(): BuildOptions['rolldownOptions'] {
  const output = {
    entryFileNames: 'shell.mjs',
    chunkFileNames: '[name].[hash].chunk.mjs',
    assetFileNames: (assetInfo: { names?: string[]; name?: string }) => {
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
    onwarn(warning, warn) {
      if (
        warning.code === 'SOURCEMAP_BROKEN' &&
        warning.plugin === '@tailwindcss/vite:generate:build'
      ) {
        return;
      }
      warn(warning);
    },
  };
}
