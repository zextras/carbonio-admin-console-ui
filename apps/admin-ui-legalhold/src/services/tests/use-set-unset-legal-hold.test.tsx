/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSetUnsetLegalHold } from '../use-set-unset-legal-hold';

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../set-unset-legalhold', () => ({
  setUnsetLegalHold: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';

import { setUnsetLegalHold } from '../set-unset-legalhold';

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

describe('useSetUnsetLegalHold', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  const variables = { status: 'set', id: 'acc-1', serverName: 'mailstore1.test.com' };

  it('should call setUnsetLegalHold and invalidate legal hold queries', async () => {
    vi.mocked(setUnsetLegalHold).mockResolvedValue({ type: 'success', accounts: [] });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSetUnsetLegalHold(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setUnsetLegalHold).toHaveBeenCalledWith('set', 'acc-1', 'mailstore1.test.com');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['legal-hold'] });
  });

  it('should show an error snackbar when the service fails', async () => {
    vi.mocked(setUnsetLegalHold).mockResolvedValue({ type: 'error', error: 'Toggle failed' });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSetUnsetLegalHold(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Toggle failed' }),
    );
  });
});
