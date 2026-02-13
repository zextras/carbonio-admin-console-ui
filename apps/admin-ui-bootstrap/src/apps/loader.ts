/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAppStore } from '@zextras/ui-shared';

import { loadAllAppsFromRegistry } from './app-registry';
import type { AppManifest } from './types';

const appContextMap = new Map<string, AppManifest>();

export function loadAllApps(): void {
  loadAllAppsFromRegistry(useAppStore, appContextMap);
}
