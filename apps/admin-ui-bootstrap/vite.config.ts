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
import { getWorkspaceRoot } from './vite-config/utils';
import tailwindcss from '@tailwindcss/vite';

const rootDir = getWorkspaceRoot();
const packageName = 'carbonio-admin-ui';
const basePath = `/static/iris/${packageName}/`;

function getProxyTarget(): string {
  const target = process.env.VITE_TARGET || 'localhost';
  return `https://${target}:6071`;
}

function withLocationRewrite(config: {
  target: string;
  changeOrigin: boolean;
  secure: boolean;
}): object {
  return {
    ...config,
    cookieDomainRewrite: { '*': 'localhost' },
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any, req: any) => {
        const targetUrl = new URL(config.target);
        proxyReq.setHeader('Origin', targetUrl.origin);
        if (req.headers['referer']) {
          proxyReq.setHeader(
            'Referer',
            req.headers['referer'].replace('http://localhost:3000', targetUrl.origin),
          );
        }
      });

      proxy.on('proxyRes', (proxyRes: any) => {
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
          if (Array.isArray(cookies)) {
            proxyRes.headers['set-cookie'] = cookies.map((cookie: string) =>
              cookie.replace(/;\s*Secure/gi, '').replace(/;\s*SameSite=\w+/gi, ''),
            );
          } else if (typeof cookies === 'string') {
            proxyRes.headers['set-cookie'] = cookies
              .replace(/;\s*Secure/gi, '')
              .replace(/;\s*SameSite=\w+/gi, '');
          }
        }
        const location = proxyRes.headers['location'];
        if (location) {
          proxyRes.headers['location'] = location.replace(
            /https:\/\/[^/]+/,
            'http://localhost:3000',
          );
        }
      });
    },
  };
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
          plugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]],
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
      tailwindcss(),
      {
        name: 'trailing-slash-redirect',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/carbonioAdmin') {
              res.writeHead(301, { Location: '/carbonioAdmin/' });
              res.end();
              return;
            }
            if (req.url?.startsWith('/static/')) {
              res.writeHead(301, { Location: `/carbonioAdmin${req.url}/` });
              res.end();
              return;
            }
            next();
          });
        },
      },
    ],
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
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
              '/login': withLocationRewrite({
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
              }),
              '/service': withLocationRewrite({
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
              }),
            },
          },
        }
      : {}),
  };
});
