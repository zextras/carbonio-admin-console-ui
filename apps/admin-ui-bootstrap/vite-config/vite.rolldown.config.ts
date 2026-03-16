/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { BuildOptions } from 'vite';

export function createBootstrapRolldownOptions(): BuildOptions['rolldownOptions'] {
  return {
    output: {
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
    },
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
