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

vi.mock('../re-sync-gal-account-service', () => ({
  reSyncGalAccount: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';

import { reSyncGalAccount } from '../re-sync-gal-account-service';
import { useReSyncGalAccount } from '../use-re-sync-gal-account';

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

describe('useReSyncGalAccount', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  it('should call reSyncGalAccount for each accountId', async () => {
    vi.mocked(reSyncGalAccount).mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useReSyncGalAccount(), { wrapper });

    result.current.mutate(['acc-1', 'acc-2']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reSyncGalAccount).toHaveBeenCalledWith('acc-1');
    expect(reSyncGalAccount).toHaveBeenCalledWith('acc-2');
    expect(reSyncGalAccount).toHaveBeenCalledTimes(2);
  });

  it('should show a success snackbar on success', async () => {
    vi.mocked(reSyncGalAccount).mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useReSyncGalAccount(), { wrapper });

    result.current.mutate(['acc-1']);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        label: 'GAL successfully re-synced',
      })
    );
  });

  it('should show an error snackbar on failure', async () => {
    vi.mocked(reSyncGalAccount).mockRejectedValue(new Error('Sync failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useReSyncGalAccount(), { wrapper });

    result.current.mutate(['acc-1']);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Sync failed',
      })
    );
  });
});
