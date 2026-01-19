/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { OutputOptions, RollupOptions } from 'rollup';

/**
 * Shared external dependencies for ESM microfrontend modules.
 * These will be resolved via import maps at runtime.
 * Only include packages that can be successfully vendored for offline use.
 */
export const SHARED_EXTERNALS = [
  'react',
  'react-dom',
  'lodash-es',
  'styled-components',
  'i18next',
  '@tanstack/react-query',
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
 * Creates standardized rollup options for microfrontend ESM modules.
 * All dependencies are resolved via import maps - no globals needed.
 *
 * @param options - Configuration for the module
 * @returns RollupOptions configured for ESM output
 */
export function createModuleRollupOptions(options: ESMModuleRollupOptions): RollupOptions {
  const { externals = [], includeDefaults = true } = options;

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
 * Creates standardized rollup options for the ESM bootstrap application (shell).
 * The shell bundles all dependencies - they are provided to sub-apps via import maps
 * which point to separately built shared-deps bundles.
 *
 * @param isDev - Whether this is a development build
 * @returns RollupOptions configured for the ESM shell
 */
export function createBootstrapRollupOptions(isDev: boolean): RollupOptions {
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
    // Shell bundles everything - shared deps are built separately and loaded via import maps
    // Sub-apps externalize and resolve these via import maps at runtime
    output,
  };
}

// Re-export for backwards compatibility during migration
export { createModuleRollupOptions as createESMModuleRollupOptions };
export { createBootstrapRollupOptions as createESMBootstrapRollupOptions };
