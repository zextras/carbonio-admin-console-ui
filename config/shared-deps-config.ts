/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { resolve } from 'path';

type DepType = 'build-vite' | 'wrap-cjs';

export type DepConfig = {
  name: string;
  entry: string;
  outputName: string;
  type: DepType;
  external?: string[];
};

export function sharedDepsConfig(nodeModulesDir: string, isDev: boolean): DepConfig[] {
  return [
    {
      name: 'react',
      entry: resolve(
        nodeModulesDir,
        isDev ? 'react/cjs/react.development.js' : 'react/cjs/react.production.js',
      ),
      outputName: 'index.mjs',
      type: 'wrap-cjs',
    },
    {
      name: 'react-dom',
      entry: resolve(
        nodeModulesDir,
        isDev ? 'react-dom/cjs/react-dom.development.js' : 'react-dom/cjs/react-dom.production.js',
      ),
      outputName: 'client.mjs',
      type: 'wrap-cjs',
    },
    {
      name: 'lodash-es',
      entry: resolve(nodeModulesDir, 'lodash-es/lodash.js'),
      outputName: 'lodash.mjs',
      type: 'build-vite',
    },
    {
      name: 'styled-components',
      entry: resolve(nodeModulesDir, 'styled-components/dist/styled-components.browser.esm.js'),
      outputName: 'styled-components.browser.esm.mjs',
      type: 'build-vite',
      external: ['react', 'react-dom'],
    },
    {
      name: 'i18next',
      entry: resolve(nodeModulesDir, 'i18next/i18next.js'),
      outputName: 'i18next.mjs',
      type: 'build-vite',
    },
    {
      name: 'react-i18next',
      entry: resolve(nodeModulesDir, 'react-i18next/dist/es/index.js'),
      outputName: 'react-i18next.mjs',
      type: 'build-vite',
      external: ['react', 'react-dom', 'i18next'],
    },
    {
      name: '@tanstack/react-query',
      entry: resolve(nodeModulesDir, '@tanstack/react-query/build/modern/index.js'),
      outputName: 'react-query.mjs',
      type: 'build-vite',
      external: ['react', 'react-dom'],
    },
    {
      name: 'react-router-dom',
      entry: resolve(nodeModulesDir, 'react-router-dom/esm/react-router-dom.js'),
      outputName: 'react-router-dom.mjs',
      type: 'build-vite',
      external: ['react', 'react-dom'],
    },
    {
      name: 'zustand',
      entry: resolve(nodeModulesDir, 'zustand/esm/index.mjs'),
      outputName: 'zustand.mjs',
      type: 'build-vite',
      external: ['react', 'react-dom'],
    },
    {
      name: 'posthog-js',
      entry: resolve(nodeModulesDir, 'posthog-js/dist/array.full.no-external.js'),
      outputName: 'posthog.mjs',
      type: 'build-vite',
    },
    {
      name: 'date-fns',
      entry: resolve(nodeModulesDir, 'date-fns/index.js'),
      outputName: 'date-fns.mjs',
      type: 'build-vite',
    },
  ];
}

export function getSharedDepNames(): Array<string> {
  return sharedDepsConfig('', false).map((dep) => dep.name);
}

export function getSharedDepPaths(): Record<string, string> {
  return Object.fromEntries(sharedDepsConfig('', false).map((dep) => [dep.name, dep.outputName]));
}
