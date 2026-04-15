/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { vi } from 'vitest';

export {
  fetchExternalSoap,
  getSoapFetchRequest,
  postSoapFetchRequest,
  soapFetch,
} from '@zextras/ui-shared';

export const useDomainInformation = vi.fn();
export const addRoute = vi.fn();
export const removeRoute = vi.fn();
export const registerActions = vi.fn();
export const useUserAccount = vi.fn();
export const useUserAccounts = vi.fn();
export const useUserSettings = vi.fn();
export const getIntegratedFunction = vi.fn();
export const usePrimaryBarState = vi.fn();
export const useAllConfig = vi.fn();
export const useIsAdvanced = vi.fn();
export const useIntegratedComponent = vi.fn();
export const useCurrentUserRights = vi.fn();
export const replaceHistory = vi.fn();
export const getRoutes = vi.fn(() => []);
export const useRoutes = vi.fn(() => []);
export const useContextBridge = vi.fn();
export const queryClient = vi.fn();
export const useTotalQuotaActive = vi.fn(() => false);
