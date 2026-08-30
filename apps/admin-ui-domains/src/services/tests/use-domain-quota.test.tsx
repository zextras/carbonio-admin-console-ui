/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetDomainQuota = vi.hoisted(() => vi.fn());

vi.mock('../domain-quota', () => ({
  getDomainQuota: mockGetDomainQuota,
}));

import { useDomainQuota } from '../use-domain-quota';

function makeWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const SUCCESS = { type: 'success' as const, limit: 10737418240 };

describe('useDomainQuota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the success payload', async () => {
    mockGetDomainQuota.mockResolvedValue(SUCCESS);

    const { result } = renderHook(() => useDomainQuota('domain-1'), {
      wrapper: makeWrapper(new QueryClient()),
    });

    await waitFor(() => expect(result.current.data).toEqual(SUCCESS));
    expect(mockGetDomainQuota).toHaveBeenCalledWith('domain-1');
  });

  it('should throw when the service returns an error result', async () => {
    mockGetDomainQuota.mockResolvedValue({ type: 'error', error: 'boom' });

    const { result } = renderHook(() => useDomainQuota('domain-1'), {
      wrapper: makeWrapper(new QueryClient()),
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
    expect((result.current.error as Error).message).toBe('boom');
  });

  it('should stay disabled while the domain id is undefined', () => {
    mockGetDomainQuota.mockResolvedValue(SUCCESS);

    const { result } = renderHook(() => useDomainQuota(undefined), {
      wrapper: makeWrapper(new QueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetDomainQuota).not.toHaveBeenCalled();
  });

  it('should stay disabled when enabled is false', () => {
    mockGetDomainQuota.mockResolvedValue(SUCCESS);

    const { result } = renderHook(() => useDomainQuota('domain-1', false), {
      wrapper: makeWrapper(new QueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetDomainQuota).not.toHaveBeenCalled();
  });
});
