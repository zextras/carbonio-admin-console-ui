/* eslint-disable no-console */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync } from 'fs';
import { dirname, join } from 'path';

const VENDORABLE_DEPS: Record<string, string> = {
  react: 'index.mjs',
  'react-dom': 'client.mjs',
  'lodash-es': 'lodash.mjs',
  'styled-components': 'styled-components.browser.esm.mjs',
  i18next: 'i18next.mjs',
  'react-i18next': 'react-i18next.mjs',
  '@tanstack/react-query': 'react-query.mjs',
  'react-router-dom': 'react-router-dom.mjs',
  zustand: 'zustand.mjs',
};

export function getSharedDependencyPaths(commitHash: string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(VENDORABLE_DEPS).map(([name, file]) => [
      name,
      `/static/iris/shared-dependencies/${commitHash}/${file}`,
    ]),
  );
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
export function log(message: string, color: ColorName = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

export function findWorkspaceRoot(): string {
  let currentDir = process.cwd();

  while (currentDir !== '/') {
    if (existsSync(join(currentDir, 'pnpm-workspace.yaml'))) {
      return currentDir;
    }
    currentDir = dirname(currentDir);
  }

  throw new Error('Could not find workspace root (pnpm-workspace.yaml not found)');
}
