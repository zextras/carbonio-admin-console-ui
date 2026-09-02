/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateSnackbar = vi.fn();
const mockGetDistributionList = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../get-distribution-list', () => ({
  getDistributionList: (...args: Array<string>) => mockGetDistributionList(...args),
}));

import { useDistributionList } from '../use-distribution-list';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return { wrapper: Wrapper, queryClient };
}

describe('use-distribution-list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the distribution list when an id is provided', async () => {
    mockGetDistributionList.mockResolvedValue({ dl: [{ id: 'dl-1', name: 'team@example.com' }] });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDistributionList('dl-1', 'team@example.com'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.dl?.[0]?.id).toBe('dl-1');
    expect(mockGetDistributionList).toHaveBeenCalledWith('dl-1', 'team@example.com');
  });

  it('does not fetch when the list id is missing', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDistributionList(undefined, 'team@example.com'), {
      wrapper,
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetDistributionList).not.toHaveBeenCalled();
  });

  it('shows an error snackbar when the request fails', async () => {
    mockGetDistributionList.mockRejectedValue(new Error('Load failed'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDistributionList('dl-1', 'team@example.com'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Load failed' }),
    );
  });

  it('falls back to the generic message for non-Error rejections', async () => {
    mockGetDistributionList.mockRejectedValue('not an error');
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDistributionList('dl-1', 'team@example.com'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Something went wrong. Please try again.',
      }),
    );
  });
});
