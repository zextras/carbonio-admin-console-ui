/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useAccountDirectory } from '../use-account-directory';

vi.mock('../account-list-directory-service', () => ({
  accountListDirectory: vi.fn(),
}));

import { accountListDirectory } from '../account-list-directory-service';

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

describe('useAccountDirectory', () => {
  it('should not fetch when the search string is empty', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAccountDirectory('', 'hold-1'), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(accountListDirectory).not.toHaveBeenCalled();
  });

  it('should search accounts and return the merged list', async () => {
    const accounts = [{ id: 'acc-1', name: 'lawyer@test.com', a: [], type: 'usr' }];
    vi.mocked(accountListDirectory).mockResolvedValue({ type: 'success', accounts });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAccountDirectory('lawyer', 'hold-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(accountListDirectory).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeAccountId: 'hold-1',
        query: expect.stringContaining('lawyer'),
      }),
    );
    expect(result.current.data).toEqual(accounts);
  });
});
