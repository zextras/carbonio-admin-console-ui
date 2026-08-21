/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useBackupAccounts } from '../use-backup-accounts';

vi.mock('../get-backup-accounts', () => ({
  getBackupAccounts: vi.fn(),
}));

import { getBackupAccounts } from '../get-backup-accounts';

const params = {
  domain: 'test.com',
  filter: '',
  legalHold: false,
  page: 0,
  pageSize: 10,
};

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

describe('useBackupAccounts', () => {
  it('should return parsed backup accounts on success', async () => {
    const accounts = [
      {
        id: 'acc-1',
        name: 'admin@test.com',
        status: 'active',
        legalHold: 'false',
        serverName: 'mailstore1.test.com',
        creationTimestamp: 1,
      },
    ];
    vi.mocked(getBackupAccounts).mockResolvedValue({ type: 'success', accounts, maxPage: 1 });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useBackupAccounts(params), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ type: 'success', accounts, maxPage: 1 });
  });

  it('should surface service errors', async () => {
    vi.mocked(getBackupAccounts).mockResolvedValue({ type: 'error', error: 'Backup unavailable' });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useBackupAccounts(params), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
    expect(result.current.error).toEqual(new Error('Backup unavailable'));
  });
});
