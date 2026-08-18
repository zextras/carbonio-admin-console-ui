/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useGetAccount } from '../use-get-account';

vi.mock('../get-account', () => ({
  getAccount: vi.fn(),
}));

import { getAccount } from '../get-account';

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

describe('useGetAccount', () => {
  it('should return the account on success', async () => {
    const account = { id: 'acc-1', name: 'lh_admin@test.com', a: [] };
    vi.mocked(getAccount).mockResolvedValue({ type: 'success', account });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetAccount(), { wrapper });

    result.current.mutate('lh_admin@test.com');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAccount).toHaveBeenCalledWith('lh_admin@test.com');
    expect(result.current.data).toEqual(account);
  });

  it('should surface service errors', async () => {
    vi.mocked(getAccount).mockResolvedValue({ type: 'error', error: 'Not found' });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetAccount(), { wrapper });

    result.current.mutate('missing@test.com');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('Not found'));
  });
});
