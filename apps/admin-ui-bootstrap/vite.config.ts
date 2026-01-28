/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getOptimizedDeps } from '../../vite-config/optimized-deps';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import { createBootstrapRollupOptions } from '../../vite.rollup.config';
import { appRegistryPlugin } from './vite-config/vite-plugin-app-registry';
import { buildSharedDepsPlugin } from './vite-config/vite-plugin-build-shared-deps';
import { postBuildPlugin } from './vite-config/vite-plugin-post-build';
import { getCommitHash, getWorkspaceRoot } from '../../scripts/utils';

const rootDir = getWorkspaceRoot();
const commitHash = getCommitHash();
const packageName = 'carbonio-admin-ui';
const basePath = `/static/iris/${packageName}/${commitHash}/`;
const appsDir = resolve(rootDir, 'apps');
const apps = readdirSync(appsDir).filter(
  (dir) => dir.startsWith('admin-ui-') && dir !== 'admin-ui-bootstrap',
);
const outDir = resolve(rootDir, 'dist', 'opt', 'zextras', 'admin', 'iris', packageName, commitHash);

function getProxyTarget(): string {
  const target = process.env.VITE_TARGET || 'localhost';
  console.log('Proxy target:', `https://${target}:6071`);
  return `https://${target}:6071`;
}

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const proxyTarget = getProxyTarget();

  return {
    plugins: [
      buildSharedDepsPlugin({ isDev }),
      postBuildPlugin(),
      appRegistryPlugin(),
      react({
        babel: {
          plugins: ['babel-plugin-styled-components'],
        },
      }),
      svgr({
        svgrOptions: {
          ref: true,
          svgo: false,
          titleProp: true,
          exportType: 'default',
        },
        include: '**/*.svg',
      }),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      COMMIT_ID: JSON.stringify(commitHash),
      BASE_PATH: JSON.stringify(isDev ? '/carbonioAdmin/' : basePath),
    },
    resolve: {
      alias: {
        path: 'path-browserify',
        ...apps.reduce((acc: Record<string, string>, dir: string) => {
          const packageJsonPath = join(appsDir, dir, 'package.json');
          try {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            if (packageJson.name) {
              const indexPath = join(appsDir, dir, 'src/index.ts');
              const appPath = join(appsDir, dir, 'src/app.tsx');
              acc[packageJson.name] = existsSync(indexPath) ? indexPath : appPath;
            }
          } catch {
            // Skip if package.json cannot be read
          }
          return acc;
        }, {}),
      },
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.d.ts'],
      dedupe: [
        'react',
        'react-dom',
        'lodash-es',
        'styled-components',
        'i18next',
        'react-i18next',
        '@tanstack/react-query',
        'react-router-dom',
        'zustand',
      ],
    },
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: isDev,
      rollupOptions: createBootstrapRollupOptions(),
    },
    logLevel: 'warn',
    optimizeDeps: {
      include: getOptimizedDeps(),
    },
    base: isDev ? '/carbonioAdmin/' : basePath,
    publicDir: 'assets',
    server: {
      port: 3000,
      strictPort: false,
      proxy: {
        '/carbonioAdmin/static': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/carbonioAdmin\/static/, '/static'),
          followRedirects: true,
        },
        '/service': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/logout': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/zx': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/services': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/login': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
