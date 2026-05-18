/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type { Account, AccountSettings } from '../types/account';
export type {
  AppRoute,
  AppRouteData,
  AppRouteDescriptor,
  AppState,
  AppView,
  AppViewComponentProps,
  BadgeInfo,
  CarbonioModule,
  PanelMode,
  PrimaryAccessoryView,
  PrimaryAccessoryViewProps,
  PrimaryBarComponentProps,
  PrimaryBarView,
  Right,
  SecondaryAccessoryView,
  SecondaryBarComponentProps,
  SecondaryBarView,
  UtilityBarComponentProps,
  UtilityView,
} from '../types/apps';
export type {
  Action,
  ActionFactory,
  ActionMap,
  AnyFunction,
  IntegrationsState,
} from '../types/integrations';
export type { II18nFactory } from '../types/misc';
export type { ThemeExtension } from '../types/theme';
export type { Breakpoint } from './hooks/use-breakpoint';
export { default as I18nFactory } from './i18n/i18n-factory';
import type { AppRouteDescriptor, CarbonioModule } from '../types';
import { getAppContext, registerApp } from './apps/loader';
import {
  ACTION_TYPES,
  BASENAME,
  CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE,
  CARBONIO_CE_ADMIN_DOCUMENTATION_URL,
  CARBONIO_HELP_ADMIN_URL,
  CARBONIO_HELP_ADVANCED_URL,
  CARBONIO_LOGO_URL,
  CONFIG,
  CONTENT,
  FORUM_URL,
  LOCAL_STORAGE_LAST_PRIMARY_KEY,
  LOGIN_V3_CONFIG_PATH,
  OPEN_TICKET_URL,
  SCALING_LIMIT,
  SCALING_OPTIONS,
  SEND_FEEDBACK_URL,
  SHELL_APP_ID,
  TRUE,
  ZIMBRA_ADMIN_URN,
} from './constants';
import { replaceHistory, useCurrentRoute } from './history/hooks';
import { useBreakpoint } from './hooks/use-breakpoint';
import { useLocalStorage } from './hooks/use-local-storage';
import { useMediaQuery } from './hooks/use-media-query';
import { useTotalQuotaActive } from './hooks/use-total-quota-active';
import {
  type CloseSnackbarFn,
  type CreateSnackbarFn,
  type CreateSnackbarFnArgs,
  SnackbarManagerContext,
  useSnackbar,
} from './hooks/useSnackbar';
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
import { useGlobalCarbonioSendAnalytics } from './react-query/use-global-settings';
import { queryFnIsAdvancedSupported, useIsAdvanced } from './react-query/use-is-advanced-supported';
import { useLastLoginTimestamp } from './react-query/use-last-login';
import { useMailstoreServers } from './react-query/use-mailstore-servers';
import {
  getAllRights,
  getRights,
  useCurrentUserRights,
  useHasAllRights,
} from './react-query/use-rights';
import { useAllServers, useMtaServers, useServerVersion } from './react-query/use-servers';
import {
  type Feature,
  invalidateLicenseQuery,
  type LicenseInfo,
  type LicenseResponse,
  type LicenseSubType,
  type LicenseType,
  type MaintenanceStatus,
  type ModuleLicenseInfo,
  useActivateLicense,
  useLicenseInfo,
  useModuleLicenseInfo,
  useRemoveLicense,
  useVersion,
} from './react-query/use-subscription';
import { fetchAccountSettings } from './services/account-api';
import { getAllNotifications, readUnreadNotification } from './services/notification-service';
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
import { useDomainStore } from './store/shared/domains';
import { useStickyBarStore } from './store/shared/sticky-bar';
import { useUtilityBarStore } from './utility-bar/store';
import { isValidDecimalNumber } from './utils/validators';

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
  ACTION_TYPES,
  addRoute,
  BASENAME,
  CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE,
  CARBONIO_CE_ADMIN_DOCUMENTATION_URL,
  CARBONIO_HELP_ADMIN_URL,
  CARBONIO_HELP_ADVANCED_URL,
  CARBONIO_LOGO_URL,
  CONFIG,
  CONTENT,
  fetchAccountSettings,
  fetchExternalSoap,
  FORUM_URL,
  getAccount,
  getAllNotifications,
  getAllRights,
  getApp,
  getLocale,
  getRights,
  getShell,
  getSoapFetchRequest,
  invalidateLicenseQuery,
  isValidDecimalNumber,
  LOCAL_STORAGE_LAST_PRIMARY_KEY,
  LOGIN_V3_CONFIG_PATH,
  loginConfig,
  logout,
  normalizeRoute,
  OPEN_TICKET_URL,
  postSoapFetchRequest,
  queryClient,
  queryFnIsAdvancedSupported,
  ReactQueryProvider,
  readUnreadNotification,
  registerActions,
  registerApp,
  removeRoute,
  replaceHistory,
  SCALING_LIMIT,
  SCALING_OPTIONS,
  SEND_FEEDBACK_URL,
  SHELL_APP_ID,
  SnackbarManagerContext,
  soapFetch,
  TRUE,
  useActions,
  useActivateLicense,
  useAllConfig,
  useAllServers,
  useAppList,
  useAppRoutes,
  useAppStore,
  useBackupServers,
  useBreakpoint,
  useBridge,
  useConfigAttribute,
  useContextBridge,
  useCurrentRoute,
  useCurrentUserRights,
  useDomainInformation,
  useDomainStore,
  useGlobalCarbonioSendAnalytics,
  useHasAllRights,
  useI18nStore,
  useIntegrationsStore,
  useIsAdvanced,
  useLastLoginTimestamp,
  useLicenseInfo,
  useLocalStorage,
  useLoginConfigStore,
  useMailstoreServers,
  useMediaQuery,
  useModuleLicenseInfo,
  useMtaServers,
  usePrimaryBarState,
  useRemoveLicense,
  useServerVersion,
  useSnackbar,
  useStickyBarStore,
  useTotalQuotaActive,
  useUserAccount,
  useUserAccounts,
  useUserSettings,
  useUtilityBarStore,
  useVersion,
  ZIMBRA_ADMIN_URN,
};
export type { CloseSnackbarFn, CreateSnackbarFn, CreateSnackbarFnArgs };
export type {
  Feature,
  LicenseInfo,
  LicenseResponse,
  LicenseSubType,
  LicenseType,
  MaintenanceStatus,
  ModuleLicenseInfo,
};
