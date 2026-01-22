#!/usr/bin/env node

import { buildApp } from './scripts/build';
import { buildShell } from './scripts/build-shell';

const command = process.argv[2];

const options = {
  dev: process.argv.includes('--dev'),
  pkgRel: process.argv.find((arg) => arg.startsWith('--pkgRel='))?.split('=')[1],
};

switch (command) {
  case 'buildApp':
    buildApp(options);
    break;
  case 'buildShell':
    buildShell(options);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error('Available commands: buildApp, buildShell');
    process.exit(1);
}
