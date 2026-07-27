/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* THIS FILE CONTAINS HOOKS, BUT ESLINT IS DUMB */

import { sortBy } from 'lodash-es';
import { useMemo } from 'react';

import { AppRoute, CarbonioModule, PrimarybarSection,PrimaryBarView } from '../../../types';
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

export function buildPrimaryBarOrderedViews(
  primaryBar: Array<PrimaryBarView>,
  sections: Array<PrimarybarSection>,
): Array<PrimaryBarView> {
  type Group = { position: number; views: Array<PrimaryBarView> };

  const groups: Array<Group> = primaryBar
    .filter((v) => !v.section)
    .map((v) => ({ position: v.position, views: [v] }));

  for (const section of sections) {
    const children = primaryBar.filter((v) => v.section?.id === section.id);
    if (children.length > 0) {
      groups.push({ position: section.position, views: children });
    }
  }

  return sortBy(groups, 'position').flatMap((g) => g.views);
}

export function buildModuleCrumbMenu(
  primaryBar: Array<PrimaryBarView>,
  sections: Array<PrimarybarSection>,
  pathname: string,
): Array<ModuleCrumbMenuItem> {
  const visibleViews = primaryBar.filter((v) => v.visible);
  if (visibleViews.length < 2) return [];

  const segments = pathname.substring(1).split('/').filter(Boolean);
  const modulePath = segments.slice(0, 2).join('/');

  const ordered = buildPrimaryBarOrderedViews(visibleViews, sections);

  const currentIndex = ordered.findIndex((v) => v.path === modulePath);
  const menuViews =
    currentIndex >= 0
      ? [ordered[currentIndex]!, ...ordered.filter((_, i) => i !== currentIndex)]
      : ordered;

  return menuViews.map((v) => ({
    path: `/${v.path}`,
    label: v.label,
  }));
}

export function useModuleCrumbMenu(pathname: string): Array<ModuleCrumbMenuItem> {
  const primaryBar = useAppStore((s) => s.views.primaryBar);
  const sections = useAppStore((s) => s.views.primarybarSections);
  return buildModuleCrumbMenu(primaryBar, sections, pathname);
}
