/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { OutputOptions, RollupOptions } from 'rollup';

/**
 * Shared external dependencies for ESM modules
 * These will be resolved via import maps
 * Only include packages that can be successfully vendored for offline use
 */
export const SHARED_EXTERNALS = [
  'react',
  'react-dom',
  'lodash-es',
  'styled-components',
  'i18next',
  '@zextras/admin-ui-bootstrap',
  'msw',
] as const;

/**
 * Configuration options for ESM module rollup
 */
export interface ESMModuleRollupOptions {
  packageName: string;
  externals?: string[];
  includeDefaults?: boolean;
}

/**
 * Creates standardized rollup options for microfrontend ESM modules
 * No globals - all dependencies resolved via import maps
 *
 * @param options - Configuration for the module
 * @returns RollupOptions configured for ESM output
 */
export function createESMModuleRollupOptions(options: ESMModuleRollupOptions): RollupOptions {
  const { packageName, externals = [], includeDefaults = true } = options;

  const allExternals = includeDefaults ? [...SHARED_EXTERNALS, ...externals] : externals;

  const output: OutputOptions = {
    exports: 'default',
    entryFileNames: '[name].[hash].mjs',
    chunkFileNames: '[name].[hash].chunk.mjs',
    inlineDynamicImports: false, // Enable code splitting
    assetFileNames: (assetInfo) => {
      const fileName = assetInfo.names?.[0] || assetInfo.name || '';
      if (fileName.endsWith('.css')) {
        return 'style.[hash].css';
      }
      return '[name].[hash][extname]';
    },
    interop: 'auto',
    // No globals - ESM uses import maps
  };

  return {
    external: allExternals,
    output,
  };
}

/**
 * Creates standardized rollup options for the ESM bootstrap application
 *
 * @param isDev - Whether this is a development build
 * @returns RollupOptions configured for the ESM shell
 */
export function createESMBootstrapRollupOptions(isDev: boolean): RollupOptions {
  const output: OutputOptions = {
    entryFileNames: isDev ? 'shell.mjs' : 'shell.[hash].mjs',
    chunkFileNames: '[name].[hash].chunk.mjs',
    assetFileNames: (assetInfo) => {
      const fileName = assetInfo.names?.[0] || assetInfo.name || '';
      if (fileName.endsWith('.css')) {
        return '[name].[hash].css';
      }
      return '[name].[hash][extname]';
    },
    // Bootstrap can inline its code but should keep app imports dynamic
    inlineDynamicImports: true,
  };

  return {
    // Externalize shared dependencies - they will be loaded via import map
    external: [...SHARED_EXTERNALS],
    output,
  };
}
