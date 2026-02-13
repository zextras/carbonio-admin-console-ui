/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import { createBootstrapRollupOptions } from './vite-config/vite.rollup.config';
import { buildSharedDepsPlugin } from './vite-config/vite-plugin-build-shared-deps';
import { postBuildPlugin } from './vite-config/vite-plugin-post-build';
import { getWorkspaceRoot } from '../../scripts/utils';

const rootDir = getWorkspaceRoot();
const packageName = 'carbonio-admin-ui';
const basePath = `/static/iris/${packageName}/`;

function getProxyTarget(): string {
  const target = process.env.VITE_TARGET || 'localhost';
  return `https://${target}:6071`;
}

export default defineConfig(({ command, mode }) => {
  const isServeCommand = command === 'serve';
  const isDev = mode === 'development';
  const proxyTarget = getProxyTarget();
  if (isServeCommand) {
    console.log('Proxy target:', `https://${proxyTarget}:6071`);
  }

  return {
    plugins: [
      ...(isServeCommand ? [] : [buildSharedDepsPlugin({ isDev }), postBuildPlugin()]),
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
        exclude: '**/src/assets/**/*.svg',
      }),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      BASE_PATH: JSON.stringify(basePath),
    },
    build: {
      outDir: resolve(rootDir, 'dist', 'opt', 'zextras', 'admin', 'iris', packageName),
      emptyOutDir: true,
      sourcemap: isDev,
      rollupOptions: createBootstrapRollupOptions(),
    },
    base: isServeCommand ? '/carbonioAdmin/' : basePath,
    publicDir: 'assets',
    ...(isDev
      ? {
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
        }
      : {}),
  };
});
