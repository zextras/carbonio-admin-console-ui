/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { buildApp } from './scripts/build-app';
import { buildShell } from './scripts/build-shell';
import { buildUnified } from './scripts/build-unified';
import { deploy } from './scripts/deploy';
import { reset } from './scripts/reset';

const command = process.argv[2];

const options = {
  dev: process.argv.includes('--dev'),
  pkgRel: process.argv.find((arg) => arg.startsWith('--pkgRel='))?.split('=')[1],
  remoteHost: process.argv.find((arg) => arg.startsWith('--host='))?.split('=')[1],
};

switch (command) {
  case 'buildApp':
    buildApp(options);
    break;
  case 'buildShell':
    buildShell();
    break;
  case 'reset':
    reset();
    break;
  case 'buildUnified':
    buildUnified();
    break;
  case 'deploy':
    deploy(options.remoteHost ?? '');
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error('Available commands: buildApp, buildShell');
    process.exit(1);
}
