/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { AppManifest } from './types';

const appContextMap = new Map<string, AppManifest>();

export const getAppContext = (packageName: string): AppManifest | undefined =>
  appContextMap.get(packageName);
