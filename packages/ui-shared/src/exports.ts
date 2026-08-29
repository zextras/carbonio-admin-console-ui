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
export type { ResponsiveContainerOptions } from './hooks/responsive-container';
export type { Breakpoint } from './hooks/use-breakpoint';
export { default as I18nFactory } from './i18n/i18n-factory';
export type { ConfigAttribute } from './react-query/use-modify-config';
export type { BatchRequest } from './services/batch-service';
import type { AppRouteDescriptor, CarbonioModule } from '../types';
import { getAppContext, registerApp } from './apps/loader';

export * from './constants/route-ids';
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
import { buildPath, replaceHistory, useCurrentRoute, useRelativePathname } from './history/hooks';
import { getResponsiveContainerStyle, getResponsiveMaxWidth } from './hooks/responsive-container';
import { useBreakpoint } from './hooks/use-breakpoint';
import { useDebouncedValue } from './hooks/use-debounced-value';
import { useLocalStorage } from './hooks/use-local-storage';
import { useMediaQuery } from './hooks/use-media-query';
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
import { useCosList } from './react-query/use-cos-list';
import { domainByIdKey, useDomainById } from './react-query/use-domain-by-id';
import { useDomainInformation } from './react-query/use-domain-information';
import { useDomainSearch } from './react-query/use-domain-search';
import { useGlobalCarbonioSendAnalytics, useGlobalSettings } from './react-query/use-global-settings';
import { queryFnIsAdvancedSupported, useIsAdvanced } from './react-query/use-is-advanced-supported';
import { useLastLoginTimestamp } from './react-query/use-last-login';
import { useMailstoreServers } from './react-query/use-mailstore-servers';
import { modifyConfigAttributes, useModifyConfig } from './react-query/use-modify-config';
import {
	type Notification,
	notificationsQueryKeys,
	useAllNotifications,
	useReadUnreadNotification,
} from './react-query/use-notifications';
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
import { batchService } from './services/batch-service';
import {
  type CosAttribute,
  type CosEntry,
  getCosGeneralInformation,
  type GetCosResponse,
} from './services/cos-general-information-service';
import { flushCache } from './services/flush-cache-service';
import {
  type CoreAttributeRequest,
  type CoreAttributeValue,
  getCoreAttributes,
  type GetCoreAttributesResponse,
} from './services/get-core-attributes';
import { getDomainInformation } from './services/get-domain-information';
import { getAllNotifications, readUnreadNotification } from './services/notification-service';
import { getCosList } from './services/search-cos-service';
import {
  type DirectoryAttribute,
  type DirectoryEntry,
  type DomainDirectories,
  searchDirectory,
  type SearchDomainDirectories,
} from './services/search-directory-service';
import { setCoreAttributes } from './services/set-core-attributes';
import { useDetailViewMaxWidth, usePrimaryBarState } from './shell/hooks';
import { getApp, getShell, useAppList, useAppRoutes, useModuleCrumbMenu } from './store/app/hooks';
import { useAppStore } from './store/app/store';
import { normalizeRoute } from './store/app/utils';
import { useBridge, useContextBridge } from './store/context-bridge';
import { getLocale } from './store/i18n/hooks';
import { useI18nStore } from './store/i18n/store';
import { useActions } from './store/integrations/hooks';
import { useIntegrationsStore } from './store/integrations/store';
import { useLoginConfigStore } from './store/login/store';
import { useStickyBarStore } from './store/shared/sticky-bar';
import { useUtilityBarStore } from './utility-bar/store';
import { isUnlimitedQuantity } from './utils/quantity';
import { isValidDecimalInput } from './utils/validators';

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

/**
 * Registers an app route.
 *
 * `route` is the raw, app-declared segment (e.g. `'storage'`). The store derives the full URL
 * `path` by prefixing it with `primarybarSection.id` when a section is provided — so
 * `primarybarSection.id` is BOTH the primary-bar grouping key AND the URL prefix
 * (e.g. section `'manage'` + route `'storage'` → mounted at `/manage/storage`).
 *
 * See {@link AppRoute} for the stored shape (`route` raw + `path` prefixed).
 */
const addRoute = (route: Partial<AppRouteDescriptor>) =>
  useAppStore.getState().setters.addRoute(normalizeRoute(route, getCallerPkg()));
const removeRoute = (routeId: string) => useAppStore.getState().setters.removeRoute(routeId);
const registerActions = useIntegrationsStore.getState().registerActions;

export {
  ACTION_TYPES,
  addRoute,
  BASENAME,
  batchService,
  buildPath,
  CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE,
  CARBONIO_CE_ADMIN_DOCUMENTATION_URL,
  CARBONIO_HELP_ADMIN_URL,
  CARBONIO_HELP_ADVANCED_URL,
  CARBONIO_LOGO_URL,
  CONFIG,
  CONTENT,
  domainByIdKey,
  fetchAccountSettings,
  fetchExternalSoap,
  flushCache,
  FORUM_URL,
  getAccount,
  getAllNotifications,
  getAllRights,
  getApp,
  getCoreAttributes,
  getCosGeneralInformation,
  getCosList,
  getDomainInformation,
  getLocale,
  getResponsiveContainerStyle,
  getResponsiveMaxWidth,
  getRights,
  getShell,
  getSoapFetchRequest,
  invalidateLicenseQuery,
  isUnlimitedQuantity,
  isValidDecimalInput,
  LOCAL_STORAGE_LAST_PRIMARY_KEY,
  LOGIN_V3_CONFIG_PATH,
  loginConfig,
  logout,
  modifyConfigAttributes,
  normalizeRoute,
  notificationsQueryKeys,
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
  searchDirectory,
  SEND_FEEDBACK_URL,
  setCoreAttributes,
  SHELL_APP_ID,
  SnackbarManagerContext,
  soapFetch,
  TRUE,
  useActions,
  useActivateLicense,
  useAllConfig,
  useAllNotifications,
  useAllServers,
  useAppList,
  useAppRoutes,
  useAppStore,
  useBackupServers,
  useBreakpoint,
  useBridge,
  useConfigAttribute,
  useContextBridge,
  useCosList,
  useCurrentRoute,
  useCurrentUserRights,
  useDebouncedValue,
  useDetailViewMaxWidth,
  useDomainById,
  useDomainInformation,
  useDomainSearch,
  useGlobalCarbonioSendAnalytics,
  useGlobalSettings,
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
  useModifyConfig,
  useModuleCrumbMenu,
  useModuleLicenseInfo,
  useMtaServers,
  usePrimaryBarState,
  useReadUnreadNotification,
  useRelativePathname,
  useRemoveLicense,
  useServerVersion,
  useSnackbar,
  useStickyBarStore,
  useUserAccount,
  useUserAccounts,
  useUserSettings,
  useUtilityBarStore,
  useVersion,
  ZIMBRA_ADMIN_URN,
};
export type {
  CloseSnackbarFn,
  CoreAttributeRequest,
  CoreAttributeValue,
  CosAttribute,
  CosEntry,
  CreateSnackbarFn,
  CreateSnackbarFnArgs,
  DirectoryAttribute,
  DirectoryEntry,
  DomainDirectories,
  GetCoreAttributesResponse,
  GetCosResponse,
  SearchDomainDirectories,
};
export type {
  Feature,
  LicenseInfo,
  LicenseResponse,
  LicenseSubType,
  LicenseType,
  MaintenanceStatus,
  ModuleLicenseInfo,
};
export type { Notification };
