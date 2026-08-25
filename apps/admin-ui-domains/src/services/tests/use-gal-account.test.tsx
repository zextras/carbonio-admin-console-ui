/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetAccount = vi.hoisted(() => vi.fn());

vi.mock('../get-account', () => ({
  getAccount: mockGetAccount,
}));

import { useGalAccount } from '../use-gal-account';

function makeWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const MOCK_ACCOUNT = { account: [{ id: 'acc-1', name: 'test@domain.com' }] };

describe('useGalAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return account data on success', async () => {
    mockGetAccount.mockResolvedValue(MOCK_ACCOUNT);

    const { result } = renderHook(() => useGalAccount('acc-1'), {
      wrapper: makeWrapper(new QueryClient()),
    });

    await waitFor(() => expect(result.current.data).toEqual(MOCK_ACCOUNT));
    expect(mockGetAccount).toHaveBeenCalledWith('acc-1');
  });

  it('should handle error from getAccount', async () => {
    mockGetAccount.mockRejectedValue(new Error('Account not found'));

    const { result } = renderHook(() => useGalAccount('acc-1'), {
      wrapper: makeWrapper(new QueryClient()),
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
    expect((result.current.error as Error).message).toBe('Account not found');
  });

  it('should stay disabled while accountId is undefined', () => {
    mockGetAccount.mockResolvedValue(MOCK_ACCOUNT);

    const { result } = renderHook(() => useGalAccount(undefined), {
      wrapper: makeWrapper(new QueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetAccount).not.toHaveBeenCalled();
  });
});
