/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAppStore } from '../store/app';
import { loadAllAppsFromRegistry } from './app-registry';
import type { AppManifest } from './types';

const appContextMap = new Map<string, AppManifest>();

export const getAppContext = (packageName: string): AppManifest | undefined =>
  appContextMap.get(packageName);

export async function loadAllApps(): Promise<void> {
  await loadAllAppsFromRegistry(useAppStore, appContextMap);
}
