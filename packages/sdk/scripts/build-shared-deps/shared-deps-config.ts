/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { join, resolve } from 'path';

import { findWorkspaceRoot } from '../utils';

type DepType = 'copy' | 'build-vite' | 'wrap-cjs';

export type DepConfig = {
  name: string;
  entry: string;
  outputName: string;
  type: DepType;
  external?: string[];
};

const rootDir = findWorkspaceRoot();
const nodeModulesDir = join(rootDir, 'node_modules');

/**
 * Build configuration for each shared dependency
 * We use Vite to bundle them into browser-compatible ESM
 */
export const sharedDepsConfig: DepConfig[] = [
  {
    name: 'react',
    entry: resolve(nodeModulesDir, 'react/cjs/react.production.js'),
    outputName: 'index.mjs',
    type: 'wrap-cjs',
  },
  {
    name: 'react-dom',
    entry: resolve(nodeModulesDir, 'react-dom/cjs/react-dom.production.js'),
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
];
