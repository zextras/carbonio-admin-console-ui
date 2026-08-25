/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../check-auth-config-service', () => ({
  checkAuthConfig: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';

import { checkAuthConfig } from '../check-auth-config-service';
import { useCheckAuthConfig } from '../use-check-auth-config';

const mockCreateSnackbar = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return { wrapper: Wrapper };
}

describe('useCheckAuthConfig', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  const body = {
    name: 'user',
    password: 'secret',
    a: [{ n: 'zimbraAuthMech', _content: 'ldap' }],
  };

  it('should call checkAuthConfig with the provided body', async () => {
    vi.mocked(checkAuthConfig).mockResolvedValue({ code: [{ _content: 'check.OK' }] });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCheckAuthConfig(), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(checkAuthConfig).toHaveBeenCalledWith(body);
  });

  it('should treat a non-OK code as failure and show an error snackbar', async () => {
    vi.mocked(checkAuthConfig).mockResolvedValue({ code: [{ _content: 'check.FAILED' }] });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCheckAuthConfig(), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Something went wrong. Please try again.',
      }),
    );
  });

  it('should show an error snackbar on SOAP failure', async () => {
    vi.mocked(checkAuthConfig).mockRejectedValue(new Error('Auth check failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCheckAuthConfig(), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Auth check failed',
      }),
    );
  });
});
