/* eslint-disable no-console */
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const deploy = (remoteHost: string) => {
  if (!remoteHost) {
    console.error('❌ Error: Please provide the remote host as a command-line argument.');
    console.log('Usage: node deploy.js <remote_host>');
    process.exit(1);
  }

  const config = {
    remoteUser: 'root',
    remoteHost,
    remoteDest: '/tmp',
    artifactsDir: './artifacts/ubuntu-jammy',
    packagePattern: 'carbonio-admin-console-ui',
  };

  // Helper to run shell commands with live output
  const run = (command: string) => {
    console.log(`\n> ${command}`);
    try {
      execSync(command, { stdio: 'inherit', encoding: 'utf-8' });
    } catch (error) {
      console.error(`\n❌ Command failed: ${command}: `, (error as Error).message);
      process.exit(1);
    }
  };

  console.log(`🚀 Starting deployment to host: **${config.remoteHost}**`);

  // 1. Build the unified package and create .deb files
  console.log('🔨 Starting Build...');
  run('pnpm build:unified');

  // 2. Create the .deb packages
  console.log('📦 Packaging...');
  run('./scripts/build_packages.sh');

  // 3. find the newest .deb file in the artifacts directory
  console.log('🔍 Searching for the newest artifact...');

  const filesInDir = readdirSync(config.artifactsDir);

  const matchingFiles = filesInDir
    .filter((file) => file.startsWith(config.packagePattern) && file.endsWith('.deb'))
    .map((file) => {
      const filePath = join(config.artifactsDir, file);
      return {
        name: file,
        path: filePath,
        time: statSync(filePath).mtimeMs,
      };
    })
    .sort((a, b) => b.time - a.time);

  const newestArtifact = matchingFiles[0];

  if (!newestArtifact) {
    console.error(`❌ Could not find a .deb file in ${config.artifactsDir} matching the pattern.`);
    process.exit(1);
  }

  const debFile = newestArtifact.name;

  if (!debFile) {
    console.error(`❌ Could not find a .deb file in ${config.artifactsDir}`);
    process.exit(1);
  }

  const localPath = join(config.artifactsDir, debFile);
  console.log(`✅ Found artifact: ${debFile}`);

  // 4. SCP the file
  console.log('⬆️ Uploading to server...');
  run(`scp ${localPath} ${config.remoteUser}@${config.remoteHost}:${config.remoteDest}`);

  // 5. SSH and Install
  console.log('🛠️ Installing on remote...');
  const remotePath = `${config.remoteDest}/${debFile}`;
  run(
    `ssh ${config.remoteUser}@${config.remoteHost} "apt install ${remotePath} --reinstall -y --allow-downgrades"`,
  );

  console.log('\n✨ Deployment Complete!');
};

deploy(process.argv[2]);
