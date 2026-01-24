/* eslint-disable no-console */
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { spawn } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

type BuildOptions = {
  dev?: boolean;
  pkgRel?: string;
  [key: string]: string | boolean | undefined;
};

const buildApp = async (options: BuildOptions): Promise<void> => {
  const args = process.argv.slice(2);
  if (options.dev) {
    args.push('--dev');
  }

  if (options.pkgRel) {
    args.push(`--pkgRel=${options.pkgRel}`);
  }

  const projectRoot = process.cwd();

  const isDev = args.includes('--dev');

  const env = {
    ...process.env,
    NODE_ENV: isDev ? 'development' : 'production',
  };

  console.log(`Building in ${isDev ? 'development' : 'production'} mode`);

  // Clean the dist directory before building
  const distPath = join(projectRoot, 'dist');
  if (existsSync(distPath)) {
    console.log('Cleaning dist directory...');
    rmSync(distPath, { recursive: true, force: true });
  }

  const vite = spawn('vite', ['build', ...(isDev ? ['--mode', 'development'] : [])], {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
    shell: true,
  });

  vite.on('close', (code) => {
    if (code !== 0) {
      console.error(`Vite build failed with code ${code}`);
      process.exit(code || 1);
    }
    console.log('\n✅ Build completed successfully!');
  });
};

buildApp({});
