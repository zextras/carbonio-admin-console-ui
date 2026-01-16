/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defineConfig } from 'vitest/config';

function jsdomProjectConfig() {
  return {
    test: {
      name: 'unit',
      environment: 'jsdom',
      setupFiles: ['./vitest-jsdom-setup.ts'],
      env: {
        TZ: 'UTC',
      },
      include: ['src/**/*.test.{ts,tsx}', './fonts.d.ts'],
      exclude: ['dist/**', 'node_modules/**'],
      globals: true,
      css: true,
      clearMocks: true,
      mockReset: true,
      restoreMocks: true,
      testTimeout: 10000,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
  };
}

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    projects: [jsdomProjectConfig()],
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
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        '**/*.config.{js,ts}',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      include: ['src/**/*.{ts,tsx}'],
    },
  },
});
