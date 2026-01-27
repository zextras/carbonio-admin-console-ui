/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path, { join } from 'node:path';

import { spawn } from 'node:child_process';

import { colorLog, copyRecursive, findWorkspaceRoot } from './utils';

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
  const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();

  const isDev = args.includes('--dev');

  const env = {
    ...process.env,
    NODE_ENV: isDev ? 'development' : 'production',
  };

  colorLog(`Building in ${isDev ? 'development' : 'production'} mode`, 'blue');
  colorLog(`Commit hash: ${commitHash}`, 'blue');

  // Clean the dist directory before building
  const distPath = path.join(projectRoot, 'dist');
  if (existsSync(distPath)) {
    colorLog('🧹 Cleaning dist directory...', 'blue');
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
      colorLog(`❌ Vite build failed with code ${code}`, 'red');
      process.exit(code || 1);
    }
    colorLog('\n✅ Build completed successfully!', 'green');

    // Read carbonio.name from package.json
    // const packageJsonPath = path.join(projectRoot, 'package.json');
    // const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    // const carbonioName = packageJson.carbonio?.name;
    //
    // if (!carbonioName) {
    //   colorLog('❌ Error: carbonio.name not found in package.json', 'red');
    //   process.exit(1);
    // }
    //
    // colorLog(`Carbonio module name: ${carbonioName}`, 'blue');
    //
    // // Copy built files to package directory
    // colorLog('\n📦 Copying built files to package directory...', 'blue');
    // const rootDir = findWorkspaceRoot();
    // const packageDir = path.resolve(
    //   rootDir,
    //   'package',
    //   'opt',
    //   'zextras',
    //   'admin',
    //   'iris',
    //   carbonioName,
    // );
    //
    // // Clean package directory before writing
    // if (existsSync(packageDir)) {
    //   rmSync(packageDir, { recursive: true, force: true });
    //   colorLog(`Cleaned ${packageDir}`, 'blue');
    // }
    //
    // // Ensure package directory exists
    // mkdirSync(packageDir, { recursive: true });
    //
    // const distSourceDir = join(projectRoot, 'dist', 'source');
    // // Copy all files from dist to package directory
    // copyRecursive(distSourceDir, packageDir);
    // colorLog(`✅ Copied to ${packageDir}`, 'green');
    //
    // colorLog(`\n🎉 Build and packaging completed successfully!`, 'green');
    // colorLog(`Output directory: ${distPath}`, 'gray');
    // colorLog(`Package directory: ${packageDir}`, 'gray');
  });
};

buildApp({});
