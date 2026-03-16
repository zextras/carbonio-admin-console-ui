/* eslint-disable no-console */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync } from 'fs';
import { dirname, join } from 'path';

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
