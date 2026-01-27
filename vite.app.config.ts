/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { createModuleRollupOptions } from './vite.rollup.config';

export interface AppViteConfigOptions {
  /** Additional resolve aliases (e.g., tinymce for domains app) */
  additionalAliases?: Record<string, string>;
}

export function createAppViteConfig(options: AppViteConfigOptions = {}): UserConfig {
  const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();
  const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
  const packageName = packageJson.carbonio.name;
  const mode = process.env.NODE_ENV || 'production';

  return {
    mode,
    plugins: [react()],
    resolve: {
      alias: {
        'app-entrypoint': resolve(process.cwd(), 'src/app.tsx'),
        ...options.additionalAliases,
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      outDir: `dist/source/${commitHash}`,
      emptyOutDir: true,
      lib: {
        entry: 'src/app.tsx',
        formats: ['es'],
      },
      rollupOptions: createModuleRollupOptions({ packageName }),
      cssCodeSplit: false,
      sourcemap: true,
      minify: mode === 'development' ? false : 'esbuild',
      target: 'es2020',
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
  };
}
