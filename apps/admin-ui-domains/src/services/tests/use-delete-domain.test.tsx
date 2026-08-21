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

vi.mock('../delete-domain-service', () => ({
  deleteDomain: vi.fn(),
}));

vi.mock('@zextras/ui-shared', () => ({
  domainByIdKey: (domainId: string, applyConfig = 1) => ['domain', 'by-id', domainId, applyConfig],
}));

import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey } from '@zextras/ui-shared';

import { deleteDomain } from '../delete-domain-service';
import { domainQueryKeys } from '../domain-query-keys';
import { useDeleteDomain } from '../use-delete-domain';

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

describe('useDeleteDomain', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  it('should call deleteDomain and invalidate caches on success', async () => {
    vi.mocked(deleteDomain).mockResolvedValue({});

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteDomain('domain-1'), { wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteDomain).toHaveBeenCalledWith('domain-1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainByIdKey('domain-1', 1) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainByIdKey('domain-1', 0) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.quota('domain-1') });
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('should show an error snackbar on failure', async () => {
    vi.mocked(deleteDomain).mockRejectedValue(new Error('Delete failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteDomain('domain-1'), { wrapper });

    result.current.mutate();

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Delete failed',
      }),
    );
  });
});
