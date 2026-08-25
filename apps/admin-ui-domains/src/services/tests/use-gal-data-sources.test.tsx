/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetDatasource = vi.hoisted(() => vi.fn());

vi.mock('../get-datasource-service', () => ({
  getDatasource: mockGetDatasource,
}));

import { useGalDataSources } from '../use-gal-data-sources';

function makeWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const MOCK_DATASOURCES = { dataSource: [{ id: 'ds-1', name: 'GAL' }] };

describe('useGalDataSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return data sources on success', async () => {
    mockGetDatasource.mockResolvedValue(MOCK_DATASOURCES);

    const { result } = renderHook(() => useGalDataSources('acc-1'), {
      wrapper: makeWrapper(new QueryClient()),
    });

    await waitFor(() => expect(result.current.data).toEqual(MOCK_DATASOURCES));
    expect(mockGetDatasource).toHaveBeenCalledWith('acc-1');
  });

  it('should handle error from getDatasource', async () => {
    mockGetDatasource.mockRejectedValue(new Error('Data sources not found'));

    const { result } = renderHook(() => useGalDataSources('acc-1'), {
      wrapper: makeWrapper(new QueryClient()),
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
    expect((result.current.error as Error).message).toBe('Data sources not found');
  });

  it('should stay disabled while accountId is undefined', () => {
    mockGetDatasource.mockResolvedValue(MOCK_DATASOURCES);

    const { result } = renderHook(() => useGalDataSources(undefined), {
      wrapper: makeWrapper(new QueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetDatasource).not.toHaveBeenCalled();
  });
});
