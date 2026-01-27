/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'child_process';
import { join } from 'path';

import { colorLog, findWorkspaceRoot } from '../utils';
import { buildApps } from './build-apps';
import { discoverComponents } from './discover-components';
import { genratePkgbuild } from './generate-pkgbuild';
import { injectIndexHtml } from './inject-index-html';
import { regenerateImportMap } from './regenerate-import-map';
import { Component } from './types';

function getLastTag() {
  return execSync('git describe --tags --abbrev=0', {
    encoding: 'utf-8',
    stdio: 'pipe',
  }).trim();
}
async function buildUnified() {
  const rootDir = findWorkspaceRoot();
  const appsDir = join(rootDir, 'apps');
  const pkgVersion = getLastTag().replace(/^v/, '');
  const commitHash = execSync('git rev-parse HEAD', {
    encoding: 'utf-8',
  }).trim();

  colorLog('=== Building unified admin package ===', 'blue');
  colorLog(`Commit hash: ${commitHash}`, 'green');

  // Set up installation directories
  const packageDir = join(rootDir, 'package');
  const installDir = join(packageDir, 'opt', 'zextras', 'admin', 'iris');

  const components = discoverComponents(appsDir);

  const bootstrapApp = components.find((comp) => comp.name === 'admin-ui-bootstrap') as Component;
  await buildApps([bootstrapApp], installDir, appsDir, commitHash);

  const apps = components.filter((comp) => comp.name !== 'admin-ui-bootstrap');
  await buildApps(apps, installDir, appsDir, commitHash);

  process.chdir(rootDir);
  regenerateImportMap(commitHash, installDir);

  injectIndexHtml(installDir, commitHash);

  genratePkgbuild(components, pkgVersion, packageDir, commitHash);

  colorLog('=== Build complete! ===', 'green');
}

buildUnified();
