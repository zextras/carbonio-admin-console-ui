/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { type Account } from '../../../types';
import { useUserAccounts } from '../use-account';
import { useAllConfig } from '../use-config';
import { useGlobalCarbonioSendAnalytics, useGlobalConfigList } from '../use-global-settings';

function createWrapper(queryClient: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
}

function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('useUserAccounts', () => {
  it('wraps the cached account in an array', () => {
    const queryClient = createQueryClient();
    const account = { id: 'acc-1', name: 'admin@example.com' } as Account;
    queryClient.setQueryData(['account', 'info'], account);

    const { result } = renderHook(() => useUserAccounts(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current).toEqual([account]);
  });

  it('returns an empty array while the account is not available', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryDefaults(['account', 'info'], { enabled: false });

    const { result } = renderHook(() => useUserAccounts(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current).toEqual([]);
  });
});

describe('useAllConfig', () => {
  it('invalidates the all-config query', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(['all-config'], []);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

    const { result } = renderHook(() => useAllConfig(), {
      wrapper: createWrapper(queryClient),
    });
    act(() => {
      result.current.invalidate();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['all-config'] });
  });
});

describe('useGlobalCarbonioSendAnalytics', () => {
  it('is true when carbonioSendAnalytics is TRUE', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(['all-config'], [{ n: 'carbonioSendAnalytics', _content: 'TRUE' }]);

    const { result } = renderHook(() => useGlobalCarbonioSendAnalytics(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.data).toBe(true);
  });

  it('is false when the attribute is missing or not TRUE', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(['all-config'], [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }]);

    const { result } = renderHook(() => useGlobalCarbonioSendAnalytics(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.data).toBe(false);
  });
});

describe('useGlobalConfigList', () => {
  it('turns the global config object into key/value entries', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(['global-config'], { a: 1, b: 'two' });

    const { result } = renderHook(() => useGlobalConfigList(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.data).toEqual([
      { key: 'a', value: 1 },
      { key: 'b', value: 'two' },
    ]);
  });

  it('returns an empty list when the config is not loaded', () => {
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useGlobalConfigList({ enabled: false }), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.data).toEqual([]);
  });
});
