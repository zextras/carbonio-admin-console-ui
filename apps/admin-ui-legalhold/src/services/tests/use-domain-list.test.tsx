/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDomainList } from '../use-domain-list';

vi.mock('../search-domain-service', () => ({
  getDomainList: vi.fn(),
}));

import { getDomainList } from '../search-domain-service';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
}

describe('useDomainList', () => {
  it('should not fetch when disabled', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDomainList('test.com', false), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getDomainList).not.toHaveBeenCalled();
  });

  it('should fetch domains when enabled', async () => {
    vi.mocked(getDomainList).mockResolvedValue({
      type: 'success',
      domain: [{ id: 'd-1', name: 'test.com', a: [] }],
      searchTotal: 1,
      more: false,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDomainList('test.com'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getDomainList).toHaveBeenCalledWith('test.com', 0);
    expect(result.current.data?.domain).toHaveLength(1);
  });

  it('should surface service errors', async () => {
    vi.mocked(getDomainList).mockResolvedValue({ type: 'error', error: 'Search failed' });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDomainList('test.com'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
    expect(result.current.error).toEqual(new Error('Search failed'));
  });
});
