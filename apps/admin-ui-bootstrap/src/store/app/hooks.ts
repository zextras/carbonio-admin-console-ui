/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* THIS FILE CONTAINS HOOKS, BUT ESLINT IS DUMB */

import { sortBy } from 'lodash';
import { useMemo } from 'react';

import { AppRoute, CarbonioModule } from '../../../types';

import { useAppStore } from './store';

export const useApps = (): Record<string, CarbonioModule> => useAppStore((s) => s.apps);
export const useAppList = (): Array<CarbonioModule> => {
	const apps = useApps();
	return useMemo(() => sortBy(apps, (a) => a.priority), [apps]);
};
export const getAppList = (): Array<CarbonioModule> =>
	sortBy(useAppStore.getState().apps, (a) => a.priority);

export const getApp = (appId: string) => (): CarbonioModule => useAppStore.getState().apps[appId];
export const getApps = (): Record<string, CarbonioModule> => useAppStore.getState().apps;

export const getShell = (): CarbonioModule => useAppStore.getState().shell;
export const getRoutes = (): Record<string, AppRoute> => useAppStore.getState().routes;
export const useRoutes = (): Record<string, AppRoute> => useAppStore((s) => s.routes);
export const getRoute = (id: string): AppRoute => useAppStore.getState().routes[id];
export const useRoute = (id: string): AppRoute => useAppStore((s) => s.routes[id]);
