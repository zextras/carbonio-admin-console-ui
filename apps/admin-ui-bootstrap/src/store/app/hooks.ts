/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* THIS FILE CONTAINS HOOKS, BUT ESLINT IS DUMB */

import { sortBy } from 'lodash-es';
import { useMemo } from 'react';

import { AppRoute, CarbonioModule } from '../../../types';
import { useAppStore } from './store';

const useApps = (): Record<string, CarbonioModule> => useAppStore((s) => s.apps);
export const useAppList = (): Array<CarbonioModule> => {
	const apps = useApps();
	return useMemo(() => sortBy(apps, (a) => a.priority), [apps]);
};

export const getApp = (appId: string) => (): CarbonioModule => useAppStore.getState().apps[appId];

export const getShell = (): CarbonioModule => useAppStore.getState().shell;
export const getRoutes = (): Record<string, AppRoute> => useAppStore.getState().routes;
export const useRoutes = (): Record<string, AppRoute> => useAppStore((s) => s.routes);
