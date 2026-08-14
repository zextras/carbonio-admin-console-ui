/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  type AppRoute,
  type PrimaryAccessoryView,
  type SecondaryAccessoryView,
  useAppStore,
  useCurrentRoute,
  type UtilityView,
} from '@zextras/ui-shared';
import { filter, intersection } from 'lodash-es';

const checkList = (l1: Array<string>, l2?: Array<string>): boolean =>
  intersection(l1, l2).length > 0;

const checkRoute = (
  view: UtilityView | PrimaryAccessoryView | SecondaryAccessoryView,
  activeRoute?: AppRoute,
): boolean => {
  const activeRouteValues = Object.values(activeRoute ?? {});
  if (view.blacklistRoutes) return !checkList(activeRouteValues, view.blacklistRoutes);
  if (view.whitelistRoutes) return checkList(activeRouteValues, view.whitelistRoutes);
  return true;
};
export const useUtilityViews = (): Array<UtilityView> => {
  const utilityViews = useAppStore((s) => s.views.utilityBar);

  const activeRoute = useCurrentRoute();
  return filter(utilityViews, (v) => checkRoute(v, activeRoute));
};
export const openLink = (link: string): void => {
  window.open(link, '_blank');
};
