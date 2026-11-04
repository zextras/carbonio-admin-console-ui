/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

import { colorLog, getWorkspaceRoot } from './utils';

const REMOTE_USER = 'root';
const REMOTE_IRIS_DIR = '/opt/zextras/admin/iris';
const LOCAL_IRIS_DIR = 'dist/package/opt/zextras/admin/iris';

type Mode = 'development' | 'production';

const parseArgs = (
  args: Array<string>,
): { mode: Mode; remoteHost: string | undefined; skipBuild: boolean } => {
  const skipBuild = args.includes('--skip-build');
  const positional = args.filter((arg) => !arg.startsWith('--'));
  const isMode = (arg: string | undefined): arg is Mode =>
    arg === 'development' || arg === 'production';

  return isMode(positional[0])
    ? { mode: positional[0], remoteHost: positional[1], skipBuild }
    : { mode: 'production', remoteHost: positional[0], skipBuild };
};

const run = (command: string): void => {
  colorLog(`\n> ${command}`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit', encoding: 'utf-8' });
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}: `, (error as Error).message);
    process.exit(1);
  }
};

const deploy = (): void => {
  const { mode, remoteHost, skipBuild } = parseArgs(process.argv.slice(2));

  if (!remoteHost) {
    console.error('❌ Error: Please provide the remote host as a command-line argument.');
    colorLog('Usage: pnpm run deploy:rsync <remote_host> [--skip-build]', 'gray');
    colorLog('Usage: pnpm run deploy:rsync:dev <remote_host> [--skip-build]', 'gray');
    process.exit(1);
  }

  const remote = `${REMOTE_USER}@${remoteHost}`;
  colorLog(`🚀 Starting rsync deployment to host: **${remoteHost}** for ${mode}`, 'green');

  // 1. Build (no PKGBUILD / tarball / .deb needed)
  if (skipBuild) {
    colorLog('⏭️ Skipping build, using existing dist/', 'yellow');
  } else {
    run(mode === 'development' ? 'pnpm build:dev' : 'pnpm build');
  }

  const localIrisDir = join(getWorkspaceRoot(), LOCAL_IRIS_DIR);
  if (!existsSync(localIrisDir)) {
    console.error(`❌ Build output not found: ${localIrisDir}`);
    process.exit(1);
  }

  const components = readdirSync(localIrisDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  if (components.length === 0) {
    console.error(`❌ No components found in ${localIrisDir}`);
    process.exit(1);
  }

  // 2. Sync each component separately: the shared /i18n directory next to them
  // is owned by carbonio-webui-i18n and must never be touched by --delete.
  colorLog('⬆️ Uploading to server...', 'blue');
  const remoteComponentDirs = components.map((c) => `${REMOTE_IRIS_DIR}/${c}`).join(' ');
  run(`ssh ${remote} "mkdir -p ${remoteComponentDirs}"`);

  for (const component of components) {
    // i18n and .version are symlinks created on the remote (see below), not part of the build
    run(
      `rsync -rlt --delete --chown=root:root --chmod=D755,F644 ` +
        `--exclude='/i18n' --exclude='/.version' ` +
        `${join(localIrisDir, component)}/ ${remote}:${REMOTE_IRIS_DIR}/${component}/`,
    );
  }

  // 3. Same symlinks the .deb postinst creates
  colorLog('🔗 Linking i18n and .version on remote...', 'blue');
  const linkCommands = components
    .map(
      (c) =>
        `ln -sfn ${REMOTE_IRIS_DIR}/i18n ${REMOTE_IRIS_DIR}/${c}/i18n && ` +
        `ln -sfn /opt/zextras/.version ${REMOTE_IRIS_DIR}/${c}/.version`,
    )
    .join(' && ');
  run(`ssh ${remote} "${linkCommands}"`);

  colorLog(
    '\n✨ Deployment Complete! (hard-refresh the browser to bypass cached index.html)',
    'green',
  );
};

deploy();
