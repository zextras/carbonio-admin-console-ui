/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useCosList } from '../use-cos-list';

vi.mock('@zextras/ui-shared', () => ({
  getCosList: vi.fn(),
}));

import { getCosList } from '@zextras/ui-shared';

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

describe('useCosList', () => {
  it('should fetch cos list with provided parameters', async () => {
    const mockResponse = { cos: [{ id: 'cos-1', name: 'default', a: [] }], more: false, searchTotal: 1 };
    vi.mocked(getCosList).mockResolvedValue(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCosList({ searchQuery: 'test', limit: 10, offset: 0 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getCosList).toHaveBeenCalledWith('test', 10, 0);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should not fetch when enabled is false', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useCosList({ searchQuery: '', limit: 10, offset: 0, enabled: false }),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(getCosList).not.toHaveBeenCalled();
  });

  it('should be enabled by default', async () => {
    vi.mocked(getCosList).mockResolvedValue({ cos: [], more: false, searchTotal: 0 });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCosList({ searchQuery: '', limit: 50, offset: 0 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getCosList).toHaveBeenCalled();
  });

  it('should handle fetch errors', async () => {
    vi.mocked(getCosList).mockRejectedValue(new Error('Search failed'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCosList({ searchQuery: 'test', limit: 10, offset: 0 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
