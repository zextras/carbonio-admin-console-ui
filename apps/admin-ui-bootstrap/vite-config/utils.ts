/* eslint-disable no-console */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resolve } from 'node:path';

import { existsSync } from 'fs';
import { dirname, join } from 'path';

type DepType = 'build-vite' | 'wrap-cjs';

export type DepConfig = {
  name: string;
  entry: string;
  outputName: string;
  type: DepType;
  external?: string[];
};

export function getSharedDepsConfig(nodeModulesDir: string, isDev: boolean): DepConfig[] {
  return [
    {
      name: 'react',
      entry: resolve(
        nodeModulesDir,
        isDev ? 'react/cjs/react.development.js' : 'react/cjs/react.production.js',
      ),
      outputName: 'react.mjs',
      type: 'wrap-cjs',
    },
    {
      name: 'react-dom',
      entry: resolve(
        nodeModulesDir,
        isDev ? 'react-dom/cjs/react-dom.development.js' : 'react-dom/cjs/react-dom.production.js',
      ),
      outputName: 'react-dom.mjs',
      type: 'wrap-cjs',
    },
    {
      name: 'lodash-es',
      entry: resolve(nodeModulesDir, 'lodash-es/lodash.js'),
      outputName: 'lodash.mjs',
      type: 'build-vite',
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
      name: 'react-router',
      entry: resolve(
        nodeModulesDir,
        isDev
          ? 'react-router/dist/development/index.mjs'
          : 'react-router/dist/production/index.mjs',
      ),
      outputName: 'react-router.mjs',
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
      entry: resolve(nodeModulesDir, 'posthog-js/dist/module.js'),
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
  return getSharedDepsConfig('', false).map((dep) => dep.name);
}

function getSharedDepPaths(): Record<string, string> {
  return Object.fromEntries(
    getSharedDepsConfig('', false).map((dep) => [dep.name, dep.outputName]),
  );
}
/**
 * Generates import map for shared dependencies only.
 * Sub-apps are now bundled into the shell via static imports,
 * so they no longer need import map entries.
 */
export function generateImportMap() {
  const depPaths = getSharedDepPaths();
  const sharedDepPaths = Object.fromEntries(
    Object.entries(depPaths).map(([name, file]) => [
      name,
      `/static/iris/shared-dependencies/${file}`,
    ]),
  );

  return {
    imports: {
      ...sharedDepPaths,
    },
  };
}

// Helper to convert Hex to ANSI 24-bit color sequence
const hexToAnsi = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m`;
};

const colors = {
  green: hexToAnsi('#2ecc71'),
  blue: hexToAnsi('#3498db'),
  red: hexToAnsi('#e74c3c'),
  orange: hexToAnsi('#f39c12'),
  yellow: hexToAnsi('#f1c40f'),
  cyan: hexToAnsi('#00FFFF'),
  gray: hexToAnsi('#95a5a6'),
  reset: '\x1b[0m',
} as const;

type ColorName = keyof typeof colors;

/**
 * Logs a message to the Node.js terminal with a specific hex-based color.
 */
export function colorLog(message: string, color: ColorName = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

export function getWorkspaceRoot(dir: string = process.cwd()): string {
  if (existsSync(join(dir, 'pnpm-workspace.yaml'))) {
    return dir;
  }
  const parentDir = dirname(dir);
  if (parentDir === dir || dir === '/') {
    throw new Error('Could not find workspace root (pnpm-workspace.yaml not found)');
  }
  return getWorkspaceRoot(parentDir);
}
