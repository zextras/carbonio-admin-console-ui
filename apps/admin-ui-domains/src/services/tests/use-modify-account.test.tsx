/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../modify-account', () => ({
  modifyAccountRequest: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';

import { domainQueryKeys } from '../domain-query-keys';
import { modifyAccountRequest } from '../modify-account';
import { useModifyAccount } from '../use-modify-account';

const mockCreateSnackbar = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return { wrapper: Wrapper, queryClient };
}

describe('useModifyAccount', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  const vars = {
    id: 'acc-1',
    modifiedData: { zimbraGalSyncLdapBindPassword: 'newpassword' },
  };

  it('should call modifyAccountRequest with the provided vars', async () => {
    vi.mocked(modifyAccountRequest).mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyAccount(), { wrapper });

    result.current.mutate(vars);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifyAccountRequest).toHaveBeenCalledWith(vars.id, vars.modifiedData);
  });

  it('should invalidate galAccount and gal caches on success', async () => {
    vi.mocked(modifyAccountRequest).mockResolvedValue({});

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModifyAccount(), { wrapper });

    result.current.mutate(vars);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.galAccount('acc-1') });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.gal() });
  });

  it('should not show success snackbar (secondary mutation)', async () => {
    vi.mocked(modifyAccountRequest).mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyAccount(), { wrapper });

    result.current.mutate(vars);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateSnackbar).not.toHaveBeenCalled();
  });

  it('should show an error snackbar on failure', async () => {
    vi.mocked(modifyAccountRequest).mockRejectedValue(new Error('Modify failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyAccount(), { wrapper });

    result.current.mutate(vars);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Modify failed',
      })
    );
  });
});
