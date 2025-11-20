import { vi } from 'vitest';

export {
	soapFetch,
	getSoapFetchRequest,
	postSoapFetchRequest,
	fetchExternalSoap
} from '@zextras/admin-ui-bootstrap';

export const useDomainInformation = vi.fn();
export const addRoute = vi.fn();
export const removeRoute = vi.fn();
export const registerActions = vi.fn();
export const useUserAccount = vi.fn();
export const useUserAccounts = vi.fn();
export const useUserSettings = vi.fn();
export const getIntegratedFunction = vi.fn();
export const getTags = vi.fn();
export const usePrimaryBarState = vi.fn();
export const useAllConfig = vi.fn();
export const useIsAdvanced = vi.fn();
export const useIntegratedComponent = vi.fn();
export const useCurrentUserRights = vi.fn();
export const replaceHistory = vi.fn();
export const pushHistory = vi.fn();
export const getRoutes = vi.fn(() => []);
export const useRoutes = vi.fn(() => []);
