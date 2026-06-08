/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useCosQuota } from '../use-cos-quota';

vi.mock('../get-cos-quota', () => ({
  getCosQuota: vi.fn(),
}));

import { getCosQuota } from '../get-cos-quota';

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

describe('useCosQuota', () => {
  it('should not fetch when cosId is undefined', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCosQuota(undefined, true), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getCosQuota).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCosQuota('cos-1', false), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getCosQuota).not.toHaveBeenCalled();
  });

  it('should fetch when cosId and enabled are truthy', async () => {
    const mockResponse = {
      type: 'success' as const,
      totalComputedLimit: { type: 'limited' as const, value: 1024 },
      totalQuotaSource: 'cos' as const,
    };
    vi.mocked(getCosQuota).mockResolvedValue(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCosQuota('cos-1', true), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getCosQuota).toHaveBeenCalledWith('cos-1');
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should throw on error response type', async () => {
    const errorResponse = { type: 'error' as const, error: 'Not found' };
    vi.mocked(getCosQuota).mockResolvedValue(errorResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCosQuota('cos-err', true), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
    expect(result.current.error?.message).toBe('Not found');
  });
});
