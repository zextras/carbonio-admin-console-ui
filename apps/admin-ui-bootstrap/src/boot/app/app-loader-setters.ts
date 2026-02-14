/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// The 'useXXX' functions actually return hooks

import {
	type AppRouteDescriptor,
	type CarbonioModule,
	normalizeRoute,
	useAppStore,
	useIntegrationsStore,
} from '@zextras/ui-shared';

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
