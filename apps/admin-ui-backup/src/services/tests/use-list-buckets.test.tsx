/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../list-buckets', () => ({
  listBuckets: vi.fn(),
}));

import { listBuckets } from '../list-buckets';
import { useListBuckets } from '../use-list-buckets';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useListBuckets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and returns bucket list', async () => {
    const mockBuckets = [
      { storeType: 'S3', bucketName: 'b1', uuid: 'u1' },
    ];
    vi.mocked(listBuckets).mockResolvedValue({
      ok: true,
      response: { values: mockBuckets },
    } as never);

    const { result } = renderHook(() => useListBuckets('mail.example.com'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.buckets).toEqual(mockBuckets);
    expect(result.current.data?.ok).toBe(true);
  });

  it('returns empty bucket list when response is not ok', async () => {
    vi.mocked(listBuckets).mockResolvedValue({
      ok: false,
      response: { values: [] },
    } as never);

    const { result } = renderHook(() => useListBuckets('srv'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.buckets).toEqual([]);
  });
});
