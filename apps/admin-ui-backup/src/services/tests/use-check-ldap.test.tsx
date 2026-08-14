/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateSnackbar = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key, { i18n: {} }],
}));

vi.mock('../check-ldap', () => ({
  checkLdap: vi.fn(),
}));

import { checkLdap } from '../check-ldap';
import { useCheckLdap } from '../use-check-ldap';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useCheckLdap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows success snackbar when LDAP check returns ok', async () => {
    vi.mocked(checkLdap).mockResolvedValue({ ok: true } as never);

    const { result } = renderHook(() => useCheckLdap(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', label: 'Ldap working properly' }),
    );
  });

  it('shows error snackbar when LDAP check returns not ok', async () => {
    vi.mocked(checkLdap).mockResolvedValue({ ok: false } as never);

    const { result } = renderHook(() => useCheckLdap(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });

  it('shows error snackbar on failure', async () => {
    vi.mocked(checkLdap).mockRejectedValue(new Error('LDAP unreachable') as never);

    const { result } = renderHook(() => useCheckLdap(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'LDAP unreachable' }),
    );
  });
});
