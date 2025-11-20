/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { pushHistory, replaceHistory } from './src/history/hooks';
import {
	getSoapFetch,
	getSoapFetchRequest as getSoapFetchRequestFn,
	postSoapFetchRequest as postSoapFetchRequestFn,
	fetchExternalSoap as fetchExternalSoapFn
} from './src/network/fetch';
import {
	useHasRight,
	useRightsByType,
	getRights,
	getAllRights,
	useCurrentUserRights
} from './src/react-query/use-rights';
import { usePrimaryBarState } from './src/shell/hooks';
import { useUserAccount, useUserAccounts, useUserSettings } from './src/store/account/hooks';
import { useIsAdvanced } from './src/store/advance';
import { useAppStore } from './src/store/app/store';
import { normalizeRoute } from './src/store/app/utils';
import { useAllConfig } from './src/store/config';
import { useDomainInformation } from './src/store/domain-information';
import { getIntegratedFunction } from './src/store/integrations/getters';
import { useIntegratedComponent } from './src/store/integrations/hooks';
import { useIntegrationsStore } from './src/store/integrations/store';
import { useDomainStore } from './src/store/shared/domains';
import { useStickyBarStore } from './src/store/shared/sticky-bar';
import { getTags } from './src/store/tags';
import { AppRouteDescriptor } from './types/apps';

// NOTE: hardcoding CarbonioModule params specific to admin-ui-console,
// as for the moment we do not need to load other apps with admin-ui-bootstrap.
// the issue will be dealt with once bootstrapper is refactored
// to make the admin panel a micro-frontend
const pkg = { name: 'admin-ui-console', priority: 3, icon: 'List' };

const soapFetch = getSoapFetch(pkg.name);
const getSoapFetchRequest = getSoapFetchRequestFn(pkg.name);
const postSoapFetchRequest = postSoapFetchRequestFn(pkg.name);
const fetchExternalSoap = fetchExternalSoapFn(pkg.name);
const addRoute = (route: Partial<AppRouteDescriptor>) =>
	useAppStore.getState().setters.addRoute(normalizeRoute(route, pkg));
const removeRoute = (routeId: string) => useAppStore.getState().setters.removeRoute(routeId);
const registerActions = useIntegrationsStore.getState().registerActions;

export {
	soapFetch,
	getSoapFetchRequest,
	postSoapFetchRequest,
	fetchExternalSoap,
	addRoute,
	removeRoute,
	registerActions,
	useUserAccount,
	useUserAccounts,
	getIntegratedFunction,
	useUserSettings,
	getTags,
	replaceHistory,
	usePrimaryBarState,
	useAllConfig,
	useDomainInformation,
	useIsAdvanced,
	useIntegratedComponent,
	pushHistory,
	useDomainStore,
	useStickyBarStore,
	useHasRight,
	useRightsByType,
	getRights,
	getAllRights,
	useCurrentUserRights
};
