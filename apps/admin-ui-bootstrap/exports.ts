/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { pushHistory, replaceHistory } from './src/history/hooks';
import {
	soapFetch,
	getSoapFetchRequest,
	postSoapFetchRequest,
	fetchExternalSoap
} from './src/network/fetch';
import { useBackupServers } from './src/react-query/use-backup-servers';
import { useAllConfig } from './src/react-query/use-config';
import { useDomainInformation } from './src/react-query/use-domain-information';
import {
	useGlobalSettings,
	useGlobalCarbonioSendAnalytics,
	useGlobalConfigValue,
	useGlobalConfigList
} from './src/react-query/use-global-settings';
import { useIsAdvanced } from './src/react-query/use-is-advanced-supported';
import { useLastLoginTimestamp } from './src/react-query/use-last-login';
import { useMailstoreServers } from './src/react-query/use-mailstore-servers';
import {
	useHasRight,
	useRightsByType,
	getRights,
	getAllRights,
	useCurrentUserRights,
	useHasAllRights
} from './src/react-query/use-rights';
import { useAllServers, useMtaServers, useServersByService } from './src/react-query/use-servers';
import {
	useLicenseInfo,
	useVersion,
	useActivateLicense,
	useRemoveLicense,
	useModuleLicenseInfo
} from './src/react-query/use-subscription';
import { usePrimaryBarState } from './src/shell/hooks';
import { useUserAccount, useUserAccounts, useUserSettings } from './src/store/account/hooks';
import { useAppStore } from './src/store/app/store';
import { normalizeRoute } from './src/store/app/utils';
import { getIntegratedFunction } from './src/store/integrations/getters';
import { useIntegratedComponent } from './src/store/integrations/hooks';
import { useIntegrationsStore } from './src/store/integrations/store';
import { useAppConfigStore, useConfigurationAttribute } from './src/store/shared/app-config/store';
import { useDomainStore } from './src/store/shared/domains';
import { useStickyBarStore } from './src/store/shared/sticky-bar';
import { AppRouteDescriptor } from './types/apps';

// NOTE: hardcoding CarbonioModule params specific to admin-ui-console,
// as for the moment we do not need to load other apps with admin-ui-bootstrap.
// the issue will be dealt with once bootstrapper is refactored
// to make the admin panel a micro-frontend
const pkg = { name: 'admin-ui-console', priority: 3, icon: 'List' };

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
	replaceHistory,
	usePrimaryBarState,
	useAllConfig,
	useDomainInformation,
	useIntegratedComponent,
	pushHistory,
	useDomainStore,
	useStickyBarStore,
	useAppConfigStore,
	useConfigurationAttribute,
	useHasRight,
	useHasAllRights,
	useRightsByType,
	getRights,
	getAllRights,
	useCurrentUserRights,
	useMailstoreServers,
	useLastLoginTimestamp,
	useGlobalSettings,
	useGlobalCarbonioSendAnalytics,
	useGlobalConfigValue,
	useGlobalConfigList,
	useLicenseInfo,
	useVersion,
	useActivateLicense,
	useRemoveLicense,
	useModuleLicenseInfo,
	useAllServers,
	useMtaServers,
	useServersByService,
	useBackupServers,
	useIsAdvanced
};
