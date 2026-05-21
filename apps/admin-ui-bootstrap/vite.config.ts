/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import { createBootstrapRolldownOptions } from './vite-config/vite.rolldown.config';
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
        proxyReq.setHeader('Accept-Encoding', 'identity');
        if (req.headers['referer']) {
          proxyReq.setHeader(
            'Referer',
            req.headers['referer'].replace('http://localhost:3001', targetUrl.origin),
          );
        }
      });

      proxy.on('proxyRes', (proxyRes: any, _req: any, res: any) => {
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
          if (Array.isArray(cookies)) {
            proxyRes.headers['set-cookie'] = cookies.map((cookie: string) =>
              cookie.replaceAll(/;\s*Secure/gi, '').replaceAll(/;\s*SameSite=\w+/gi, ''),
            );
          } else if (typeof cookies === 'string') {
            proxyRes.headers['set-cookie'] = cookies
              .replaceAll(/;\s*Secure/gi, '')
              .replaceAll(/;\s*SameSite=\w+/gi, '');
          }
        }
        const location = proxyRes.headers['location'];
        if (location) {
          proxyRes.headers['location'] = location.replace(
            /https:\/\/[^/]+/,
            'http://localhost:3001',
          );
        }

        const contentType = (proxyRes.headers['content-type'] as string) ?? '';
        const shouldRewriteBody =
          contentType.includes('application/json') || contentType.includes('text/html');

        if (shouldRewriteBody) {
          delete proxyRes.headers['content-length'];

          const chunks: Buffer[] = [];
          const originalWrite = res.write.bind(res);
          const originalEnd = res.end.bind(res);

          res.write = (chunk: any, ..._args: any[]): boolean => {
            if (chunk != null) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            return true;
          };

          res.end = (chunk?: any, ..._args: any[]): any => {
            if (chunk != null) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            const body = Buffer.concat(chunks).toString('utf8');
            const modified = body.replaceAll(config.target, 'http://localhost:3001');
            res.write = originalWrite;
            res.end = originalEnd;
            return originalEnd(modified);
          };
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
    console.log('Proxy target:', proxyTarget);
  }

  return {
    plugins: [
      ...(isServeCommand ? [] : [postBuildPlugin()]),
      react({
        babel: {
          plugins: [
            ['babel-plugin-react-compiler', { panicThreshold: 'none' }],
            ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
          ],
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
              const urlWithoutQuery = req.url.split('?')[0];
              const isFile = /\.[^/]+$/.test(urlWithoutQuery);
              const normalised = req.url.endsWith('/') ? req.url.slice(0, -1) : req.url;
              const location = isFile
                ? `/carbonioAdmin${normalised}`
                : `/carbonioAdmin${normalised}/`;
              res.writeHead(301, { Location: location });
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
      outDir: resolve(rootDir, 'dist', 'package', 'opt', 'zextras', 'admin', 'iris', packageName),
      emptyOutDir: true,
      sourcemap: isDev,
      rollupOptions: createBootstrapRolldownOptions(),
    },
    base: isServeCommand ? '/carbonioAdmin/' : basePath,
    publicDir: 'assets',
    ...(isDev
      ? {
          server: {
            port: 3001,
            strictPort: false,
            proxy: {
              '/carbonioAdmin/static': {
                ...withLocationRewrite({
                  target: proxyTarget,
                  changeOrigin: true,
                  secure: false,
                }),
                rewrite: (path) => path.replace(/^\/carbonioAdmin\/static/, '/static'),
              },
              '/logout': {
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
              },
              '/zx': withLocationRewrite({
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
              }),
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
