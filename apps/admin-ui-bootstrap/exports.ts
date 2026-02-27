/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getAppContext } from './src/apps/loader';
import { pushHistory, replaceHistory } from './src/history/hooks';
import {
	fetchExternalSoap,
	getSoapFetchRequest,
	postSoapFetchRequest,
	soapFetch
} from './src/network/fetch';
import { useUserAccount, useUserAccounts, useUserSettings } from './src/react-query/use-account';
import { useBackupServers } from './src/react-query/use-backup-servers';
import { useAllConfig } from './src/react-query/use-config';
import { useDomainInformation } from './src/react-query/use-domain-information';
import {
	useGlobalCarbonioSendAnalytics,
	useGlobalConfigList,
	useGlobalConfigValue,
	useGlobalSettings
} from './src/react-query/use-global-settings';
import { useIsAdvanced } from './src/react-query/use-is-advanced-supported';
import { useLastLoginTimestamp } from './src/react-query/use-last-login';
import { useMailstoreServers } from './src/react-query/use-mailstore-servers';
import {
	getAllRights,
	getRights,
	useCurrentUserRights,
	useHasAllRights,
	useRightsByType} from './src/react-query/use-rights';
import { useAllServers, useMtaServers, useServersByService, useServerVersion } from './src/react-query/use-servers';
import {
	useActivateLicense,
	useLicenseInfo,
	useModuleLicenseInfo,
	useRemoveLicense,
	useVersion
} from './src/react-query/use-subscription';
import { usePrimaryBarState } from './src/shell/hooks';
import { useAppStore } from './src/store/app/store';
import { normalizeRoute } from './src/store/app/utils';
import { getLocale } from './src/store/i18n/hooks';
import { useIntegrationsStore } from './src/store/integrations/store';
import { useAppConfigStore, useConfigurationAttribute } from './src/store/shared/app-config/store';
import { useDomainStore } from './src/store/shared/domains';
import { useStickyBarStore } from './src/store/shared/sticky-bar';
import { AppRouteDescriptor, CarbonioModule } from './types/apps';

// Default fallback pkg for when app context cannot be determined
const defaultPkg: Pick<CarbonioModule, 'name' | 'priority' | 'icon'> = {
	name: 'carbonio-admin-ui',
	priority: 99,
	icon: 'List'
};

// Determine which app is calling by inspecting the call stack
function getCallerPkg(): Pick<CarbonioModule, 'name' | 'priority' | 'icon'> {
	const stack = new Error().stack;
	if (!stack) {
		return defaultPkg;
	}

	// The stack format varies by browser/runtime, but typically includes file paths
	// Look for apps/admin-ui-{name}/ pattern in the stack
	const match = stack.match(/apps[\\/]+admin-ui-((?:[^\\/]+))[\\/]+/);
	if (match) {
		const appName = match[1];
		const packageName = `@zextras/admin-ui-${appName}`;
		const appContext = getAppContext(packageName);

		if (appContext) {
			return {
				name: appContext.name,
				priority: appContext.priority,
				icon: appContext.icon
			};
		}
	}

	return defaultPkg;
}

const addRoute = (route: Partial<AppRouteDescriptor>) =>
	useAppStore.getState().setters.addRoute(normalizeRoute(route, getCallerPkg()));
const removeRoute = (routeId: string) => useAppStore.getState().setters.removeRoute(routeId);
const registerActions = useIntegrationsStore.getState().registerActions;

export {
	addRoute,
	fetchExternalSoap,
	getAllRights,
	getLocale,
	getRights,
	getSoapFetchRequest,
	postSoapFetchRequest,
	pushHistory,
	registerActions,
	removeRoute,
	replaceHistory,
	soapFetch,
	useActivateLicense,
	useAllConfig,
	useAllServers,
	useAppConfigStore,
	useBackupServers,
	useConfigurationAttribute,
	useCurrentUserRights,
	useDomainInformation,
	useDomainStore,
	useGlobalCarbonioSendAnalytics,
	useGlobalConfigList,
	useGlobalConfigValue,
	useGlobalSettings,
	useHasAllRights,
	useIsAdvanced,
	useLastLoginTimestamp,
	useLicenseInfo,
	useMailstoreServers,
	useModuleLicenseInfo,
	useMtaServers,
	usePrimaryBarState,
	useRemoveLicense,
	useRightsByType,
	useServersByService,
	useServerVersion,
	useStickyBarStore,
	useUserAccount,
	useUserAccounts,
	useUserSettings,
	useVersion
};
