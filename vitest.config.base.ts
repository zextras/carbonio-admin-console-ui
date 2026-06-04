/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { playwright } from '@vitest/browser-playwright';
import svgr from 'vite-plugin-svgr';
import { getOptimizeDepsInclude } from './vitest.config.utils';

const isCI = !!process.env.CI;

function getPlugins() {
  return [
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
    }),
  ];
}

const tinymceNoopPath = path.resolve(__dirname, './__mocks__/tinymce-noop.js');
const tinymcePlugins = [
  'advlist',
  'anchor',
  'autolink',
  'autoresize',
  'charmap',
  'code',
  'directionality',
  'fullscreen',
  'help',
  'image',
  'insertdatetime',
  'link',
  'lists',
  'media',
  'preview',
  'quickbars',
  'searchreplace',
  'table',
  'visualblocks',
  'wordcount',
];
const tinymceSkins = [
  'tinymce/skins/ui/oxide/skin',
  'tinymce/skins/content/default/content',
  'tinymce/skins/ui/oxide/content',
];
const tinymceAliases = {
  'tinymce/tinymce': path.resolve(__dirname, './__mocks__/tinymce.js'),
  'tinymce/models/dom': tinymceNoopPath,
  'tinymce/themes/silver': tinymceNoopPath,
  'tinymce/icons/default': tinymceNoopPath,
  ...Object.fromEntries(tinymcePlugins.map((p) => [`tinymce/plugins/${p}`, tinymceNoopPath])),
  ...Object.fromEntries(tinymceSkins.map((s) => [s, tinymceNoopPath])),
};

function jsdomProjectConfig() {
  return {
    plugins: getPlugins(),
    define: { BASE_PATH: JSON.stringify('') },
    test: {
      name: 'unit',
      environment: 'jsdom',
      setupFiles: [path.resolve(__dirname, './vitest-jsdom-setup.ts')],
      sequence: { groupOrder: 1 },
      env: { TZ: 'UTC' },
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
      testTimeout: isCI ? 20_000 : 10_000,
      maxConcurrency: 5,
    },
    optimizeDeps: { include: getOptimizeDepsInclude() },
  };
}

function browserProjectConfig() {
  return {
    define: { BASE_PATH: JSON.stringify('') },
    test: {
      name: 'browser',
      setupFiles: [path.resolve(__dirname, './vitest-browser-setup.ts')],
      sequence: { groupOrder: 2 },
      fileParallelism: true,
      maxWorkers: '50%',
      minWorkers: 1,
      maxConcurrency: 1,
      retry: isCI ? 2 : 0,
      include: ['**/*.browser.test.{ts,tsx}'],
      isolate: true,
      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser: 'chromium' as const }],
        viewport: { width: 834, height: 2000 },
        headless: process.env.HEADED !== 'true',
        screenshotFailures: !isCI,
        connectTimeout: 60_000,
        providerOptions: { launch: { timeout: 60_000 } },
        assertionTimeout: 5_000,
      },
      exclude: ['dist/**', 'node_modules/**'],
      globals: true,
      css: true,
      clearMocks: true,
      testTimeout: isCI ? 20_000 : 10_000,
      hookTimeout: 15_000,
      alias: {
        'admin-ui-test-utils': path.resolve(
          __dirname,
          './packages/test-utils/src/index.browser.ts',
        ),
        ...tinymceAliases,
      },
    },
    plugins: getPlugins(),
    optimizeDeps: { include: getOptimizeDepsInclude() },
  };
}

export default defineConfig({
  server: { fs: { allow: ['../..'] } },
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
        '**/__mocks__/**',
        '**/[.]**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        '**/{karma,vite,vitest,ava,babel,nyc,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        '**/*.config.{js,ts}',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      include: ['src/**/*.{ts,tsx}'],
    },
  },
});
