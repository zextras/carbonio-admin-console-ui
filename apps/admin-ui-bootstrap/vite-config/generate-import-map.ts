/* eslint-disable no-console */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSharedDepPaths } from '../../../config/shared-deps-config';

/**
 * Generates import map for shared dependencies only.
 * Sub-apps are now bundled into the shell via static imports,
 * so they no longer need import map entries.
 */
export function generateImportMap() {
  const depPaths = getSharedDepPaths();
  const sharedDepPaths = Object.fromEntries(
    Object.entries(depPaths).map(([name, file]) => [
      name,
      `/static/iris/shared-dependencies/${file}`,
    ]),
  );

  return {
    imports: {
      ...sharedDepPaths,
    },
  };
}
