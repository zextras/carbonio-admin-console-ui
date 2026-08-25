/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getDelegateAuthRequest: vi.fn(),
}));

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../get-delegate-auth-request', () => ({
  getDelegateAuthRequest: mocks.getDelegateAuthRequest,
}));

import { useSnackbar } from '@zextras/ui-components';

import { useDelegateAuth } from '../use-delegate-auth';

const mockCreateSnackbar = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return { wrapper: Wrapper, queryClient };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
});

describe('useDelegateAuth', () => {
  it('should return the delegate-auth token on success', async () => {
    mocks.getDelegateAuthRequest.mockResolvedValue({
      authToken: [{ _content: 'token-123' }],
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDelegateAuth(), { wrapper });

    result.current.mutate('acc-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.getDelegateAuthRequest).toHaveBeenCalledWith('acc-1');
    expect(result.current.data).toBe('token-123');
    expect(mockCreateSnackbar).not.toHaveBeenCalled();
  });

  it('should throw and show an error snackbar when the response has no token', async () => {
    mocks.getDelegateAuthRequest.mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDelegateAuth(), { wrapper });

    result.current.mutate('acc-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Something went wrong. Please try again.',
      }),
    );
  });

  it('should show an error snackbar with the server message on rejection', async () => {
    mocks.getDelegateAuthRequest.mockRejectedValue(new Error('auth failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDelegateAuth(), { wrapper });

    result.current.mutate('acc-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'auth failed' }),
    );
  });
});
