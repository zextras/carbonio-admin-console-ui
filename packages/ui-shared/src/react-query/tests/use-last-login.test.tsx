/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../network/fetch', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('../../network/fetch');
const { useLastLoginTimestamp } = await import('../use-last-login');

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

describe('useLastLoginTimestamp', () => {
  beforeEach(() => {
    vi.mocked(soapFetch).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should fetch and format the last login timestamp', async () => {
    vi.mocked(soapFetch).mockResolvedValue({
      account: [
        {
          id: 'acc-1',
          name: 'user@example.com',
          a: [{ n: 'zimbraLastLogonTimestamp', _content: '20240115143022.000+0000' }],
        },
      ],
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLastLoginTimestamp({ accountId: 'acc-1' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toContain('Jan');
    expect(result.current.data).toContain('2024');
    expect(soapFetch).toHaveBeenCalledWith('GetAccount', {
      _jsns: 'urn:zimbraAdmin',
      account: [{ _content: 'acc-1', by: 'id' }],
      applyCos: 0,
      attrs: 'zimbraLastLogonTimestamp',
    });
  });

  it('should use by "name" when accountId is not provided in queryFn', async () => {
    vi.mocked(soapFetch).mockResolvedValue({
      account: [{ id: '1', name: 'user@example.com', a: [] }],
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLastLoginTimestamp({ accountId: 'acc-1' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should return empty string when no last login attribute is found', async () => {
    vi.mocked(soapFetch).mockResolvedValue({
      account: [{ id: 'acc-1', name: 'user@example.com', a: [] }],
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLastLoginTimestamp({ accountId: 'acc-1' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe('');
  });

  it('should return empty string when last login attribute has no content', async () => {
    vi.mocked(soapFetch).mockResolvedValue({
      account: [
        { id: 'acc-1', name: 'user@example.com', a: [{ n: 'zimbraLastLogonTimestamp' }] },
      ],
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLastLoginTimestamp({ accountId: 'acc-1' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe('');
  });

  it('should not fetch when accountId is undefined', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useLastLoginTimestamp({ accountId: undefined }), {
      wrapper,
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(soapFetch).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useLastLoginTimestamp({ accountId: 'acc-1', enabled: false }),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(soapFetch).not.toHaveBeenCalled();
  });

  it('should retry on failure and log warnings via retryFn', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(soapFetch).mockRejectedValue(new Error('Network error'));

    // The hook's retryFn allows 3 retries with exponential backoff (1s, 2s, 4s):
    // advance a faked clock instead of waiting ~7s of real time.
    vi.useFakeTimers();

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLastLoginTimestamp({ accountId: 'acc-1' }), {
      wrapper,
    });

    let guard = 0;
    while (!result.current.isError && guard < 20) {
      await vi.advanceTimersByTimeAsync(1000);
      guard += 1;
    }

    expect(soapFetch).toHaveBeenCalledTimes(4);
    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to fetch last login timestamp (attempt 0):',
      expect.any(Error),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to fetch last login timestamp (attempt 1):',
      expect.any(Error),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to fetch last login timestamp (attempt 2):',
      expect.any(Error),
    );
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
