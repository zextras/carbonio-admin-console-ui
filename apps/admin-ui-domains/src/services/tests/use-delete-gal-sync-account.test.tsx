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

vi.mock('../destroy-account-service', () => ({
  destroyAccount: vi.fn(),
}));

vi.mock('@zextras/ui-shared', () => ({
  domainByIdKey: (domainId: string, applyConfig = 1) => ['domain', 'by-id', domainId, applyConfig],
}));

import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey } from '@zextras/ui-shared';

import { destroyAccount } from '../destroy-account-service';
import { domainQueryKeys } from '../domain-query-keys';
import { useDeleteGalSyncAccount } from '../use-delete-gal-sync-account';

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

describe('useDeleteGalSyncAccount', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  it('should call destroyAccount with the provided accountId', async () => {
    vi.mocked(destroyAccount).mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteGalSyncAccount('domain-1'), { wrapper });

    result.current.mutate('acc-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(destroyAccount).toHaveBeenCalledWith('acc-1');
  });

  it('should invalidate gal and domain caches on success', async () => {
    vi.mocked(destroyAccount).mockResolvedValue({});

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteGalSyncAccount('domain-1'), { wrapper });

    result.current.mutate('acc-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.gal() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainByIdKey('domain-1', 1) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainByIdKey('domain-1', 0) });
  });

  it('should show a success snackbar on success', async () => {
    vi.mocked(destroyAccount).mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteGalSyncAccount('domain-1'), { wrapper });

    result.current.mutate('acc-1');

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' })
    );
  });

  it('should show an error snackbar on failure', async () => {
    vi.mocked(destroyAccount).mockRejectedValue(new Error('Delete failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteGalSyncAccount('domain-1'), { wrapper });

    result.current.mutate('acc-1');

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Delete failed',
      })
    );
  });
});
