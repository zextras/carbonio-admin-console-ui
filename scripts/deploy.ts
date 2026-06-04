/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

import { colorLog } from './utils';

const parseArgs = (args: string[]): { mode: string; remoteHost: string | undefined } => {
  const isMode = (arg: string): arg is 'development' | 'production' =>
    arg === 'development' || arg === 'production';

  return isMode(args[0])
    ? { mode: args[0], remoteHost: args[1] }
    : { mode: 'production', remoteHost: args[0] };
};

const createConfig = (remoteHost: string) => ({
  remoteUser: 'root',
  remoteHost,
  remoteDest: '/tmp',
  artifactsDir: './artifacts/ubuntu-jammy',
  packagePattern: 'carbonio-admin-console-ui',
});

const run = (command: string): void => {
  colorLog(`\n> ${command}`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit', encoding: 'utf-8' });
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}: `, (error as Error).message);
    process.exit(1);
  }
};

const findNewestArtifact = (
  artifactsDir: string,
  packagePattern: string,
): { name: string; path: string } | undefined => {
  const filesInDir = readdirSync(artifactsDir);

  const matchingFiles = filesInDir
    .filter((file) => file.startsWith(packagePattern) && file.endsWith('.deb'))
    .map((file) => ({
      name: file,
      path: join(artifactsDir, file),
      time: statSync(join(artifactsDir, file)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time);

  return matchingFiles[0];
};

const deploy = (): void => {
  const { mode, remoteHost } = parseArgs(process.argv.slice(2));

  if (!remoteHost) {
    console.error('❌ Error: Please provide the remote host as a command-line argument.');
    colorLog('Usage: pnpm run deploy <remote_host>', 'gray');
    colorLog('Usage: pnpm run deploy:dev <remote_host>', 'gray');
    process.exit(1);
  }

  const config = createConfig(remoteHost);

  colorLog(`🚀 Starting deployment to host: **${config.remoteHost}** for ${mode}`, 'green');

  // 1. Build
  const buildCommand = mode === 'development' ? 'pnpm build:dev' : 'pnpm build';
  run(buildCommand);
  run('tsx ./scripts/generate-pkgbuild.ts');

  // Create tarball expected by YAP (PKGBUILD source)
  run('tar czf dist/package/carbonio-admin-console-ui-dist.tar.gz -C . dist/package/opt');

  // 2. Create the .deb packages
  colorLog('📦 Packaging...', 'blue');
  run('./scripts/build_packages.sh');

  // 3. Find the newest .deb file in the artifacts directory
  colorLog('🔍 Searching for the newest artifact...', 'blue');
  const newestArtifact = findNewestArtifact(config.artifactsDir, config.packagePattern);

  if (!newestArtifact) {
    console.error(`❌ Could not find a .deb file in ${config.artifactsDir} matching the pattern.`);
    process.exit(1);
  }

  colorLog(`✅ Found artifact: ${newestArtifact.name}`, 'green');

  // 4. SCP the file
  colorLog('⬆️ Uploading to server...', 'blue');
  run(`scp ${newestArtifact.path} ${config.remoteUser}@${config.remoteHost}:${config.remoteDest}`);

  // 5. SSH and Install
  colorLog('🛠️ Installing on remote...', 'blue');
  const remotePath = `${config.remoteDest}/${newestArtifact.name}`;
  run(
    `ssh ${config.remoteUser}@${config.remoteHost} "apt install ${remotePath} --reinstall -y --allow-downgrades"`,
  );

  colorLog('\n✨ Deployment Complete!', 'green');
};

deploy();
