/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useFilesConfigRaw } from '../use-files-config-raw';

vi.mock('../get-files-config-raw', () => ({
  getFilesConfigRaw: vi.fn(),
}));

import { getFilesConfigRaw } from '../get-files-config-raw';

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

describe('useFilesConfigRaw', () => {
  it('should not fetch when id is undefined', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useFilesConfigRaw('cos', undefined, true), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getFilesConfigRaw).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useFilesConfigRaw('cos', 'cos-1', false), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getFilesConfigRaw).not.toHaveBeenCalled();
  });

  it('should fetch when id and enabled are truthy', async () => {
    const mockResponse = {
      type: 'success' as const,
      overrides: { 'shares-enabled': 'true' },
    };
    vi.mocked(getFilesConfigRaw).mockResolvedValue(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFilesConfigRaw('cos', 'cos-1', true), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getFilesConfigRaw).toHaveBeenCalledWith('cos', 'cos-1');
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should throw on error response type', async () => {
    const errorResponse = { type: 'error' as const, error: 'Not found' };
    vi.mocked(getFilesConfigRaw).mockResolvedValue(errorResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFilesConfigRaw('cos', 'cos-err', true), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
    expect(result.current.error?.message).toBe('Not found');
  });
});
