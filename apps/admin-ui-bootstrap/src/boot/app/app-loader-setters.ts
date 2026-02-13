/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// The 'useXXX' functions actually return hooks

import { normalizeRoute, useAppStore, useIntegrationsStore } from '@zextras/ui-shared';

import { AppRouteDescriptor, CarbonioModule } from '../../../types';

export const getAppSetters = (pkg: CarbonioModule): Record<string, Function> => {
  const appSetters = useAppStore.getState().setters;
  const integrations = useIntegrationsStore.getState();
  return {
    addRoute: (route: Partial<AppRouteDescriptor>) =>
      appSetters.addRoute(normalizeRoute(route, pkg)),
    removeRoute: (routeId: string) => appSetters.removeRoute(routeId),
    registerActions: integrations.registerActions,
  };
};
