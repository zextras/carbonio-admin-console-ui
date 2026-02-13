/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getAppContext } from './src/apps/loader';
import { pushHistory, replaceHistory, useCurrentRoute } from './src/history/hooks';
import {
  fetchExternalSoap,
  getSoapFetchRequest,
  postSoapFetchRequest,
  soapFetch,
} from './src/network/fetch';
import { getAccount } from './src/network/get-account';
import { loginConfig } from './src/network/login-config';
import { logout } from './src/network/logout';
import { useUserAccount, useUserAccounts, useUserSettings } from './src/react-query/use-account';
import { useBackupServers } from './src/react-query/use-backup-servers';
import { useAllConfig, useConfigAttribute } from './src/react-query/use-config';
import { useDomainInformation } from './src/react-query/use-domain-information';
import {
  useGlobalCarbonioSendAnalytics,
  useGlobalConfigList,
  useGlobalConfigValue,
  useGlobalSettings,
} from './src/react-query/use-global-settings';
import {
  queryFnIsAdvancedSupported,
  useIsAdvanced,
} from './src/react-query/use-is-advanced-supported';
import { useLastLoginTimestamp } from './src/react-query/use-last-login';
import { useMailstoreServers } from './src/react-query/use-mailstore-servers';
import {
  getAllRights,
  getRights,
  useCurrentUserRights,
  useHasAllRights,
  useRightsByType,
} from './src/react-query/use-rights';
import { useAllServers, useMtaServers, useServersByService } from './src/react-query/use-servers';
import {
  useActivateLicense,
  useLicenseInfo,
  useModuleLicenseInfo,
  useRemoveLicense,
  useVersion,
} from './src/react-query/use-subscription';
import { fetchAccountSettings } from './src/services/account-api';
import { usePrimaryBarState } from './src/shell/hooks';
import { getApp, getShell, useAppList, useAppRoutes } from './src/store/app/hooks';
import { useAppStore } from './src/store/app/store';
import { normalizeRoute } from './src/store/app/utils';
import { useBridge } from './src/store/context-bridge';
import { getLocale } from './src/store/i18n/hooks';
import { useI18nStore } from './src/store/i18n/store';
import { useActions } from './src/store/integrations/hooks';
import { useIntegrationsStore } from './src/store/integrations/store';
import { useLoginConfigStore } from './src/store/login/store';
import { useAppConfigStore, useConfigurationAttribute } from './src/store/shared/app-config/store';
import { useDomainStore } from './src/store/shared/domains';
import { useStickyBarStore } from './src/store/shared/sticky-bar';
import { useUtilityBarStore } from './src/utility-bar/store';
import { AppRouteDescriptor, CarbonioModule } from './types/apps';

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
  queryFnIsAdvancedSupported,
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
