import { vi } from 'vitest';

const actual = await vi.importActual('../../apps/admin-ui-bootstrap/exports');

export const useDomainInformation = vi.fn();
export const setAppContext = vi.fn();
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

// actual bootstrap functions
export const soapFetch = actual.soapFetch;
export const getSoapFetchRequest = actual.getSoapFetchRequest;
export const postSoapFetchRequest = actual.postSoapFetchRequest;
export const fetchExternalSoap = actual.fetchExternalSoap;
