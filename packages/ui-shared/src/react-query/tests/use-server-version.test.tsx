/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';

import { useServerVersion } from '../use-server-version';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
}

describe('useServerVersion', () => {
  it('should return the fetched version string on success', async () => {
    createAPIInterceptor('get', '/.version', () => HttpResponse.text('25.1.0', { status: 200 }));

    const { result } = renderHook(() => useServerVersion(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.serverVersion).toBe('25.1.0');
  });

  it('should trim whitespace from the version string', async () => {
    createAPIInterceptor('get', '/.version', () =>
      HttpResponse.text('  25.1.0  \n', { status: 200 }),
    );

    const { result } = renderHook(() => useServerVersion(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.serverVersion).toBe('25.1.0');
  });

  it('should return empty string on HTTP error', async () => {
    createAPIInterceptor('get', '/.version', () =>
      HttpResponse.text('Internal Server Error', { status: 500 }),
    );

    const { result } = renderHook(() => useServerVersion(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    expect(result.current.serverVersion).toBe('');
  });

  it('should return empty string on network error', async () => {
    createAPIInterceptor('get', '/.version', () => HttpResponse.error());

    const { result } = renderHook(() => useServerVersion(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    expect(result.current.serverVersion).toBe('');
  });

  it('should be loading initially and not loading after fetch', async () => {
    createAPIInterceptor('get', '/.version', () => HttpResponse.text('25.1.0', { status: 200 }));

    const { result } = renderHook(() => useServerVersion(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.serverVersion).toBe('25.1.0');
  });
});
