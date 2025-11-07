import { vi } from 'vitest';

// Import actual network functions directly - these should not be mocked for browser tests
export {
	soapFetch,
	getSoapFetchRequest,
	postSoapFetchRequest,
	fetchExternalSoap,
	useAdminConfigStore
} from '@zextras/admin-ui-bootstrap/network/fetch';

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
export const replaceHistory = vi.fn();
export const pushHistory = vi.fn();
