/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */


declare module 'virtual:app-registry' {
	export const APP_REGISTRY: import('./apps/types').AppManifest[];
	export const getAppByName: (name: string) => import('./apps/types').AppManifest | undefined;
	export const getAppByPackageName: (packageName: string) => import('./apps/types').AppManifest | undefined;
	export const loadAllApps: (
		useAppStore: any,
		appContextMap: Map<string, import('./apps/types').AppManifest>
	) => Promise<void>;
}
