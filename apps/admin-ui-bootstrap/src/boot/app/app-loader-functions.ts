/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CarbonioModule, AppRouteDescriptor } from '../../../types';
import { replaceHistory, pushHistory } from '../../history/hooks';
import {
	postSoapFetchRequest,
	fetchExternalSoap,
	soapFetch,
	getSoapFetchRequest
} from '../../network/fetch';
import { useBackupServers } from '../../react-query/use-backup-servers';
import { useAllConfig } from '../../react-query/use-config';
import { useDomainInformation } from '../../react-query/use-domain-information';
import {
	useGlobalSettings,
	useGlobalCarbonioSendAnalytics,
	useGlobalConfigValue,
	useGlobalConfigList
} from '../../react-query/use-global-settings';
import { useIsAdvanced } from '../../react-query/use-is-advanced-supported';
import { useLastLoginTimestamp } from '../../react-query/use-last-login';
import { useMailstoreServers } from '../../react-query/use-mailstore-servers';
import {
	useHasRight,
	useRightsByType,
	getRights,
	getAllRights,
	useCurrentUserRights,
	useHasAllRights
} from '../../react-query/use-rights';
import { useAllServers, useMtaServers, useServersByService } from '../../react-query/use-servers';
import {
	useLicenseInfo,
	useVersion,
	useActivateLicense,
	useRemoveLicense,
	useModuleLicenseInfo
} from '../../react-query/use-subscription';
import { usePrimaryBarState } from '../../shell/hooks';
import { useUserAccount, useUserAccounts, useUserSettings } from '../../store/account';
import { useAppStore } from '../../store/app';
import { normalizeRoute } from '../../store/app/utils';
import { getIntegratedFunction } from '../../store/integrations/getters';
import { useIntegratedComponent } from '../../store/integrations/hooks';
import { useIntegrationsStore } from '../../store/integrations/store';
import { useAppConfigStore, useConfigurationAttribute } from '../../store/shared/app-config/store';
import { useDomainStore } from '../../store/shared/domains';
import { useStickyBarStore } from '../../store/shared/sticky-bar';
import { getTags } from '../../store/tags';

export const getAppFunctions = (pkg: CarbonioModule): Record<string, Function> => ({
	soapFetch,
	getSoapFetchRequest,
	postSoapFetchRequest: postSoapFetchRequest(pkg.name),
	fetchExternalSoap: fetchExternalSoap(pkg.name),

	// INTEGRATIONS
	getIntegratedFunction,
	useIntegratedComponent,
	// ACCOUNTS
	useUserAccount,
	useUserAccounts,
	useUserSettings,
	getTags,
	// HISTORY
	replaceHistory,
	pushHistory,
	// STUFF
	usePrimaryBarState,
	useAllConfig,
	useIsAdvanced,
	useDomainInformation,
	useDomainStore,
	useStickyBarStore,
	useHasRight,
	useHasAllRights,
	useRightsByType,
	getRights,
	getAllRights,
	useCurrentUserRights,
	useMailstoreServers,
	// APP ROUTERS
	addRoute: (route: Partial<AppRouteDescriptor>) =>
		useAppStore.getState().setters.addRoute(normalizeRoute(route, pkg)),
	removeRoute: (routeId: string) => useAppStore.getState().setters.removeRoute(routeId),
	registerActions: useIntegrationsStore.getState().registerActions,
	useAppConfigStore,
	useConfigurationAttribute,
	useLastLoginTimestamp,
	useLicenseInfo,
	useVersion,
	useActivateLicense,
	useRemoveLicense,
	useModuleLicenseInfo,
	useAllServers,
	useMtaServers,
	useServersByService,
	useBackupServers,
	useGlobalSettings,
	useGlobalCarbonioSendAnalytics,
	useGlobalConfigValue,
	useGlobalConfigList
});
