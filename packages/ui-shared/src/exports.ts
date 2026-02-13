/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppRouteDescriptor, CarbonioModule } from '../types';
import { getAppContext } from './apps/loader';
import { pushHistory, replaceHistory, useCurrentRoute } from './history/hooks';
import {
  fetchExternalSoap,
  getSoapFetchRequest,
  postSoapFetchRequest,
  soapFetch,
} from './network/fetch';
import { getAccount } from './network/get-account';
import { loginConfig } from './network/login-config';
import { logout } from './network/logout';
import { queryClient, ReactQueryProvider } from './providers/react-query-provider';
import { useUserAccount, useUserAccounts, useUserSettings } from './react-query/use-account';
import { useBackupServers } from './react-query/use-backup-servers';
import { useAllConfig, useConfigAttribute } from './react-query/use-config';
import { useDomainInformation } from './react-query/use-domain-information';
import {
  useGlobalCarbonioSendAnalytics,
  useGlobalConfigList,
  useGlobalConfigValue,
  useGlobalSettings,
} from './react-query/use-global-settings';
import { queryFnIsAdvancedSupported, useIsAdvanced } from './react-query/use-is-advanced-supported';
import { useLastLoginTimestamp } from './react-query/use-last-login';
import { useMailstoreServers } from './react-query/use-mailstore-servers';
import {
  getAllRights,
  getRights,
  useCurrentUserRights,
  useHasAllRights,
  useRightsByType,
} from './react-query/use-rights';
import { useAllServers, useMtaServers, useServersByService } from './react-query/use-servers';
import {
  useActivateLicense,
  useLicenseInfo,
  useModuleLicenseInfo,
  useRemoveLicense,
  useVersion,
} from './react-query/use-subscription';
import { fetchAccountSettings } from './services/account-api';
import { usePrimaryBarState } from './shell/hooks';
import { getApp, getShell, useAppList, useAppRoutes } from './store/app/hooks';
import { useAppStore } from './store/app/store';
import { normalizeRoute } from './store/app/utils';
import { useBridge, useContextBridge } from './store/context-bridge';
import { getLocale } from './store/i18n/hooks';
import { useI18nStore } from './store/i18n/store';
import { useActions } from './store/integrations/hooks';
import { useIntegrationsStore } from './store/integrations/store';
import { useLoginConfigStore } from './store/login/store';
import { useAppConfigStore, useConfigurationAttribute } from './store/shared/app-config/store';
import { useDomainStore } from './store/shared/domains';
import { useStickyBarStore } from './store/shared/sticky-bar';
import { useUtilityBarStore } from './utility-bar/store';

// Default fallback pkg for when app context cannot be determined
const defaultPkg: Pick<CarbonioModule, 'name' | 'priority' | 'icon'> = {
  name: 'carbonio-admin-ui',
  priority: 99,
  icon: 'List',
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
        icon: appContext.icon,
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
  fetchAccountSettings,
  fetchExternalSoap,
  getAccount,
  getAllRights,
  getApp,
  getLocale,
  getRights,
  getShell,
  getSoapFetchRequest,
  loginConfig,
  logout,
  normalizeRoute,
  postSoapFetchRequest,
  pushHistory,
  queryClient,
  queryFnIsAdvancedSupported,
  ReactQueryProvider,
  registerActions,
  removeRoute,
  replaceHistory,
  soapFetch,
  useActions,
  useActivateLicense,
  useAllConfig,
  useAllServers,
  useAppConfigStore,
  useAppList,
  useAppRoutes,
  useAppStore,
  useBackupServers,
  useBridge,
  useConfigAttribute,
  useConfigurationAttribute,
  useContextBridge,
  useCurrentRoute,
  useCurrentUserRights,
  useDomainInformation,
  useDomainStore,
  useGlobalCarbonioSendAnalytics,
  useGlobalConfigList,
  useGlobalConfigValue,
  useGlobalSettings,
  useHasAllRights,
  useI18nStore,
  useIntegrationsStore,
  useIsAdvanced,
  useLastLoginTimestamp,
  useLicenseInfo,
  useLoginConfigStore,
  useMailstoreServers,
  useModuleLicenseInfo,
  useMtaServers,
  usePrimaryBarState,
  useRemoveLicense,
  useRightsByType,
  useServersByService,
  useStickyBarStore,
  useUserAccount,
  useUserAccounts,
  useUserSettings,
  useUtilityBarStore,
  useVersion,
};
