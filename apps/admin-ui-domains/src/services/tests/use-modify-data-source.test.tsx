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

vi.mock('../modify-datasource-service', () => ({
  modifyDataSource: vi.fn(),
}));

vi.mock('@zextras/ui-shared', () => ({
  domainByIdKey: (domainId: string, applyConfig = 1) => ['domain', 'by-id', domainId, applyConfig],
}));

import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey } from '@zextras/ui-shared';

import { domainQueryKeys } from '../domain-query-keys';
import { modifyDataSource } from '../modify-datasource-service';
import { useModifyDataSource } from '../use-modify-data-source';

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

describe('useModifyDataSource', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  const body = {
    id: 'acc-1',
    _jsns: 'urn:zimbraAdmin',
    dataSource: {
      id: 'ds-1',
      a: [{ n: 'zimbraGalMode', _content: 'both' }],
    },
  };

  it('should call modifyDataSource with the provided body', async () => {
    vi.mocked(modifyDataSource).mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyDataSource('domain-1', 'acc-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifyDataSource).toHaveBeenCalledWith(body);
  });

  it('should invalidate gal, dataSources, and domain caches on success', async () => {
    vi.mocked(modifyDataSource).mockResolvedValue({});

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModifyDataSource('domain-1', 'acc-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.galDataSources('acc-1') });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.gal() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainByIdKey('domain-1', 1) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainByIdKey('domain-1', 0) });
  });

  it('should not show success snackbar (secondary mutation)', async () => {
    vi.mocked(modifyDataSource).mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyDataSource('domain-1', 'acc-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateSnackbar).not.toHaveBeenCalled();
  });

  it('should show an error snackbar on failure', async () => {
    vi.mocked(modifyDataSource).mockRejectedValue(new Error('Modify failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyDataSource('domain-1', 'acc-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Modify failed',
      })
    );
  });
});
