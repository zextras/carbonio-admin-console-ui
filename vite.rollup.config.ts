/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { OutputOptions, RollupOptions } from "rollup";

/**
 * Shared external dependencies for all microfrontend modules
 */
export const SHARED_EXTERNALS = [
  "react",
  "react-dom",
  "react-i18next",
  "lodash-es",
  "react-router-dom",
  "styled-components",
  "@emotion/react",
  "@emotion/styled",
  "@zextras/carbonio-ui-preview",
  "@zextras/admin-ui-bootstrap",
  "@zextras/carbonio-design-system",
  "msw",
  "i18next",
] as const;

/**
 * Creates global mappings for externalized dependencies
 * Maps package names to their runtime window.__ZAPP_SHARED_LIBRARIES__ locations
 */
export function createSharedGlobals(
  packageName: string,
): Record<string, string> {
  return {
    react: '__ZAPP_SHARED_LIBRARIES__["react"]',
    "react-dom": '__ZAPP_SHARED_LIBRARIES__["react-dom"]',
    "react-i18next": '__ZAPP_SHARED_LIBRARIES__["react-i18next"]',
    "lodash-es": '__ZAPP_SHARED_LIBRARIES__["lodash-es"]',
    "react-router-dom": '__ZAPP_SHARED_LIBRARIES__["react-router-dom"]',
    "styled-components": '__ZAPP_SHARED_LIBRARIES__["styled-components"]',
    "@emotion/react": '__ZAPP_SHARED_LIBRARIES__["@emotion/react"]',
    "@emotion/styled": '__ZAPP_SHARED_LIBRARIES__["@emotion/styled"]',
    "@zextras/carbonio-ui-preview":
      '__ZAPP_SHARED_LIBRARIES__["@zextras/carbonio-ui-preview"]',
    "@zextras/admin-ui-bootstrap": `__ZAPP_SHARED_LIBRARIES__["@zextras/admin-ui-bootstrap"]["${packageName}"]`,
    "@zextras/carbonio-design-system":
      '__ZAPP_SHARED_LIBRARIES__["@zextras/carbonio-design-system"]',
    msw: '__ZAPP_SHARED_LIBRARIES__["msw"]',
    i18next: '__ZAPP_SHARED_LIBRARIES__["i18next"]',
  };
}

/**
 * Configuration options for module rollup
 */
export interface ModuleRollupOptions {
  packageName: string;
  externals?: string[];
  includeDefaults?: boolean;
}

/**
 * Creates standardized rollup options for microfrontend modules
 *
 * @param options - Configuration for the module
 * @returns RollupOptions configured for the module
 */
export function createModuleRollupOptions(
  options: ModuleRollupOptions,
): RollupOptions {
  const { packageName, externals = [], includeDefaults = true } = options;

  const allExternals = includeDefaults
    ? [...SHARED_EXTERNALS, ...externals]
    : externals;

  const output: OutputOptions = {
    exports: "default",
    entryFileNames: "[name].[hash].js",
    chunkFileNames: "[name].[hash].chunk.js",
    inlineDynamicImports: true,
    assetFileNames: (assetInfo) => {
      const fileName = assetInfo.names?.[0] || assetInfo.name || "";
      if (fileName.endsWith(".css")) {
        return "style.[hash].css";
      }
      return "[name].[hash][extname]";
    },
    interop: "compat",
    globals: createSharedGlobals(packageName),
  };

  return {
    external: allExternals,
    output,
  };
}

/**
 * Creates standardized rollup options for the bootstrap application
 *
 * @param isDev - Whether this is a development build
 * @returns RollupOptions configured for the shell
 */
export function createBootstrapRollupOptions(isDev: boolean): RollupOptions {
  const output: OutputOptions = {
    entryFileNames: isDev ? "zapp-shell.bundle.js" : "zapp-admin-ui.bundle.js",
    chunkFileNames: "[name].[hash].chunk.js",
    assetFileNames: (assetInfo) => {
      const fileName = assetInfo.names?.[0] || assetInfo.name || "";
      if (fileName.endsWith(".css")) {
        return "[name].[hash].css";
      }
      return "[name].[hash][extname]";
    },
  };

  return {
    output,
  };
}
