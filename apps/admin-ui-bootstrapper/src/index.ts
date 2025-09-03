// Re-export Tags store utilities
export * from './store/tags';

// Bound network utilities (bound to SHELL_APP_ID)
import { SHELL_APP_ID } from './constants';
import {
  getSoapFetch,
  getSoapFetchRequest as _getSoapFetchRequest,
  postSoapFetchRequest as _postSoapFetchRequest,
  fetchExternalSoap as _fetchExternalSoap
} from './network/fetch';

export const soapFetch = getSoapFetch(SHELL_APP_ID);
export const getSoapFetchRequest = _getSoapFetchRequest(SHELL_APP_ID);
export const postSoapFetchRequest = _postSoapFetchRequest(SHELL_APP_ID);
export const fetchExternalSoap = _fetchExternalSoap(SHELL_APP_ID);

// History helpers
export { pushHistory, replaceHistory } from './history/hooks';

// Account hooks
export { useUserSettings, useUserAccounts, useUserAccount } from './store/account';

// Domain information hook
export { useDomainInformation } from './store/domain-information';

// Config hooks
export { useAllConfig } from './store/config';

// Shell hooks
export { usePrimaryBarState } from './shell/hooks';

// Integrations
export { getIntegratedFunction } from './store/integrations/getters';
export { useIntegratedComponent } from './store/integrations/hooks';

// App store setter wrappers
import { useAppStore } from './store/app/store';
import type { AppRouteDescriptor } from '../types';

export const setAppContext = (ctx: unknown): void =>
  useAppStore.getState().setters.setAppContext(SHELL_APP_ID)(ctx);

export const addRoute = (route: AppRouteDescriptor): string =>
  useAppStore.getState().setters.addRoute(route);

export const removeRoute = (id: string): void =>
  useAppStore.getState().setters.removeRoute(id);

// Integrations registerActions wrapper
import { useIntegrationsStore } from './store/integrations/store';
import type { ActionFactory } from '../types';

export const registerActions = <T>(
  ...items: Array<{ id: string; action: ActionFactory<T>; type: string }>
): void => useIntegrationsStore.getState().registerActions(...items);

// Advanced
export { useIsAdvanced } from './store/advance';

