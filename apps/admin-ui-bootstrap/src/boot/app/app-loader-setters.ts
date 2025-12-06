/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// The 'useXXX' functions actually return hooks

import { AppRouteDescriptor, CarbonioModule } from '../../../types';
import { useAppStore } from '../../store/app';
import { normalizeRoute } from '../../store/app/utils';
import { useIntegrationsStore } from '../../store/integrations/store';

export const getAppSetters = (pkg: CarbonioModule): Record<string, Function> => {
	const appSetters = useAppStore.getState().setters;
	const integrations = useIntegrationsStore.getState();
	return {
		addRoute: (route: Partial<AppRouteDescriptor>) =>
			appSetters.addRoute(normalizeRoute(route, pkg)),
		removeRoute: (routeId: string) => appSetters.removeRoute(routeId),
		registerHooks: integrations.registerHooks,
		removeHooks: integrations.removeHooks,
		registerFunctions: integrations.registerFunctions,
		removeFunctions: integrations.removeFunctions,
		registerActions: integrations.registerActions,
		removeActions: integrations.removeActions,
		registerComponents: integrations.registerComponents(pkg.name),
		removeComponents: integrations.removeComponents
	};
};
