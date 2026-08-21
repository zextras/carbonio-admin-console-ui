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

vi.mock('../modify-domain-service', () => ({
  modifyDomain: vi.fn(),
}));

vi.mock('@zextras/ui-shared', () => ({
  flushCache: vi.fn(),
  domainByIdKey: (domainId: string, applyConfig = 1) => ['domain', 'by-id', domainId, applyConfig],
}));

import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey, flushCache } from '@zextras/ui-shared';

import { domainQueryKeys } from '../domain-query-keys';
import { modifyDomain } from '../modify-domain-service';
import { useModifyDomain } from '../use-modify-domain';

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

describe('useModifyDomain', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  const body = {
    id: 'domain-1',
    _jsns: 'urn:zimbraAdmin',
    a: [{ n: 'description', _content: 'Updated' }],
  };

  it('should call modifyDomain with the provided body', async () => {
    vi.mocked(modifyDomain).mockResolvedValue({ domain: [{ id: 'domain-1' }] });
    vi.mocked(flushCache).mockResolvedValue(undefined);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyDomain('domain-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifyDomain).toHaveBeenCalledWith(body);
  });

  it('should invalidate domain-by-id and quota caches on success', async () => {
    vi.mocked(modifyDomain).mockResolvedValue({ domain: [] });
    vi.mocked(flushCache).mockResolvedValue(undefined);

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModifyDomain('domain-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(flushCache).toHaveBeenCalledWith('domain', 'id', 'domain-1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainByIdKey('domain-1', 1) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainByIdKey('domain-1', 0) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.quota('domain-1') });
  });

  it('should show a success snackbar on success', async () => {
    vi.mocked(modifyDomain).mockResolvedValue({ domain: [] });
    vi.mocked(flushCache).mockResolvedValue(undefined);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyDomain('domain-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('should show an error snackbar on failure', async () => {
    vi.mocked(modifyDomain).mockRejectedValue(new Error('Modify failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyDomain('domain-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Modify failed',
      }),
    );
  });
});
