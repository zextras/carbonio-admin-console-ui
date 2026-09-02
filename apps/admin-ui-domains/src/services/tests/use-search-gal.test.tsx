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
const mockSearchGal = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../search-gal-service', () => ({
  searchGal: (...args: Array<string>) => mockSearchGal(...args),
}));

import { useSearchGal } from '../use-search-gal';

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

describe('use-search-gal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns search results for a non-empty keyword', async () => {
    mockSearchGal.mockResolvedValue({ cn: [{ name: 'joe@example.com' }] });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSearchGal('joe'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.cn?.[0]?.name).toBe('joe@example.com');
    expect(mockSearchGal).toHaveBeenCalledWith('joe');
  });

  it('does not fetch for an empty keyword', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSearchGal(''), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockSearchGal).not.toHaveBeenCalled();
  });

  it('does not fetch for a whitespace-only keyword', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSearchGal('   '), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockSearchGal).not.toHaveBeenCalled();
  });

  it('does not refetch the same keyword within the stale time', async () => {
    mockSearchGal.mockResolvedValue({ cn: [] });
    const { wrapper } = createWrapper();
    const { result, rerender } = renderHook(({ keyword }: { keyword: string }) => useSearchGal(keyword), {
      wrapper,
      initialProps: { keyword: 'joe' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ keyword: 'joe' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSearchGal).toHaveBeenCalledTimes(1);
  });

  it('shows an error snackbar when the search fails', async () => {
    mockSearchGal.mockRejectedValue(new Error('Search failed'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSearchGal('joe'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Search failed' }),
    );
  });
});
