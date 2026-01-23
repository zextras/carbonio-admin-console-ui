/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type Component = {
  readonly name: string;
  readonly target: string;
};

export type BuildContext = {
  readonly rootDir: string;
  readonly appsDir: string;
  readonly installDir: string;
  readonly packageDir: string;
  readonly commitHash: string;
  readonly pkgVersion: string;
  readonly buildEnv: NodeJS.ProcessEnv;
};

export type BuildStatus = 'built' | 'skipped' | 'failed';

export type BuildResult = {
  readonly component: Component;
  readonly status: BuildStatus;
  readonly error?: Error;
};

export type BuildStats = {
  readonly total: number;
  readonly built: number;
  readonly skipped: number;
  readonly failed: number;
  readonly builtPackages: readonly string[];
  readonly failedPackages: readonly string[];
};

export type GitStatus = {
  readonly changedComponents: ReadonlySet<string>;
};
