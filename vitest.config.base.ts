/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import svgr from 'vite-plugin-svgr';
import { playwright } from '@vitest/browser-playwright';
import { getOptimizeDepsInclude } from './vitest.config.utils';

function jsdomProjectConfig() {
  return {
    plugins: [],
    define: {
      BASE_PATH: JSON.stringify(''),
    },
    test: {
      name: 'unit',
      environment: 'jsdom',
      setupFiles: [path.resolve(__dirname, './vitest-jsdom-setup.ts')],
      env: {
        TZ: 'UTC',
      },
      alias: {
        'admin-ui-test-utils': path.resolve(__dirname, './packages/test-utils/src/index.jsdom.ts'),
        '@zextras/ui-shared': path.resolve(__dirname, './__mocks__/@zextras/ui-shared.js'),
      },
      include: ['src/**/*.test.{ts,tsx}', './fonts.d.ts'],
      exclude: ['dist/**', 'node_modules/**', '**/*.browser.test.{ts,tsx}'],
      globals: true,
      css: true,
      clearMocks: true,
      mockReset: true,
      restoreMocks: true,
      testTimeout: !!process.env.ci ? 20_000 : 10_000,
    },
    optimizeDeps: {
      include: getOptimizeDepsInclude(),
    },
  };
}

function browserProjectConfig() {
  return {
    define: {
      BASE_PATH: JSON.stringify(''),
    },
    test: {
      name: 'browser',
      setupFiles: [path.resolve(__dirname, './vitest-browser-setup.ts')],

      alias: {
        'admin-ui-test-utils': path.resolve(
          __dirname,
          './packages/test-utils/src/index.browser.ts',
        ),
        // TODO: @zextras/ui-shared alias causes browser tests to fail with "Failed to fetch dynamically imported module"
        // The issue is that the setup file path resolution doesn't work in browser mode
        // '@zextras/ui-shared': path.resolve(
        //   __dirname,
        //   './packages/ui-shared/src/exports.ts',
        // ),
        'tinymce/tinymce': path.resolve(__dirname, './__mocks__/tinymce.js'),
        'tinymce/models/dom': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/themes/silver': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/icons/default': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/advlist': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/anchor': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/autolink': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/autoresize': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/charmap': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/code': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/directionality': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/fullscreen': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/help': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/image': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/insertdatetime': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/link': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/lists': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/media': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/preview': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/quickbars': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/searchreplace': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/table': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/visualblocks': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
        'tinymce/plugins/wordcount': path.resolve(__dirname, './__mocks__/tinymce-noop.js'),
      },
      include: ['**/*.browser.test.{ts,tsx}'],
      browser: {
        enabled: true,
        provider: playwright() as any,
        instances: [{ browser: 'chromium' as const }],
        viewport: { width: 834, height: 2000 },
        headless: !!process.env.CI,
        screenshotFailures: !process.env.CI,
        providerOptions: { launch: { timeout: 60_000 } },
      },
      exclude: ['dist/**', 'node_modules/**'],
      globals: true,
      css: true,
      clearMocks: true,
      testTimeout: !!process.env.ci ? 20_000 : 10_000,
      hookTimeout: 15_000,
    },
    plugins: [
      react(),
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
    optimizeDeps: {
      include: getOptimizeDepsInclude(),
    },
  };
}

export default defineConfig({
  esbuild: {
    target: 'es2022',
  },
  test: {
    globals: true,
    passWithNoTests: true,
    projects: [jsdomProjectConfig(), browserProjectConfig()],

    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/[.]**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        '**/{karma,rollup,vite,vitest,ava,babel,nyc,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        '**/*.config.{js,ts}',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      include: ['src/**/*.{ts,tsx}'],
    },
  },
});
