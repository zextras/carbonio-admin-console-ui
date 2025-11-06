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
import { usePrimaryBarState } from './src/shell/hooks';
import { useUserAccount, useUserAccounts, useUserSettings } from './src/store/account/hooks';
import { useAdminConfigStore, useConfigurationAttribute } from './src/store/admin-config/store';
import { useIsAdvanced } from './src/store/advance';
import { useAppStore } from './src/store/app/store';
import { normalizeRoute } from './src/store/app/utils';
import { useBackupModuleStore } from './src/store/backup-module/store';
import { useBucketServersListStore } from './src/store/bucket-server-list/store';
import { useAllConfig } from './src/store/config';
import { useDomainInformation } from './src/store/domain-information';
import { Cos, Domain } from './src/store/domains';
import { DomainState, useDomainStore } from './src/store/domains/store';
import { useGlobalConfigStore } from './src/store/global-config/store';
import { getIntegratedFunction } from './src/store/integrations/getters';
import { useIntegratedComponent } from './src/store/integrations/hooks';
import { useIntegrationsStore } from './src/store/integrations/store';
import { useLastLoginTimestamp } from './src/store/last-login-timestamp/store';
import { useServerStore } from './src/store/servers/store';
import { getTags } from './src/store/tags';
import { Attribute } from './types';
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
	useServerStore,
	useGlobalConfigStore,
	useBackupModuleStore,
	useAdminConfigStore,
	useConfigurationAttribute,
	useLastLoginTimestamp,
	useBucketServersListStore,
	type DomainState,
	type Attribute,
	type Domain,
	type Cos
};
