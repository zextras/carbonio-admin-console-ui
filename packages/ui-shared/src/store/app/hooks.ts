/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* THIS FILE CONTAINS HOOKS, BUT ESLINT IS DUMB */

import { sortBy } from 'lodash-es';
import { useMemo } from 'react';

import { AppRoute, CarbonioModule, PrimaryBarView } from '../../../types';
import { useAppStore } from './store';

const useApps = (): Record<string, CarbonioModule> => useAppStore((s) => s.apps);
export const useAppList = (): Array<CarbonioModule> => {
  const apps = useApps();
  return useMemo(() => sortBy(apps, (a) => a.priority), [apps]);
};

export const getApp = (appId: string) => (): CarbonioModule => useAppStore.getState().apps[appId];

export const getShell = (): CarbonioModule => useAppStore.getState().shell;
export const getRoutes = (): Record<string, AppRoute> => useAppStore.getState().routes;
export const useAppRoutes = (): Record<string, AppRoute> => useAppStore((s) => s.routes);

export type ModuleCrumbMenuItem = {
  path: string;
  label: string;
};

export type ModuleCrumbMenu = Record<string, Array<ModuleCrumbMenuItem>>;

export function buildModuleCrumbMenu(
  primaryBar: Array<PrimaryBarView>,
  pathname: string,
): ModuleCrumbMenu {
  const segments = pathname.substring(1).split('/').filter(Boolean);
  if (segments.length < 2) return {};

  const modulePath = segments.slice(0, 2).join('/');
  const currentView = primaryBar.find((view) => view.path === modulePath);
  if (!currentView?.section) return {};

  const sectionId = currentView.section.id;
  const siblings = primaryBar.filter(
    (view) => view.visible && view.section?.id === sectionId,
  );
  if (siblings.length < 2) return {};

  const menu = sortBy(siblings, 'position').map((view) => ({
    path: `/${view.path}`,
    label: view.label,
  }));

  return { [`/${modulePath}`]: menu };
}

export function useModuleCrumbMenu(pathname: string): ModuleCrumbMenu {
  const primaryBar = useAppStore((s) => s.views.primaryBar);
  return buildModuleCrumbMenu(primaryBar, pathname);
}
