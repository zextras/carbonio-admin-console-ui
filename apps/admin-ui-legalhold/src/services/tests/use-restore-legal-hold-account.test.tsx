/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRestoreLegalHoldAccount } from '../use-restore-legal-hold-account';

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../restore-new-legal-hold-account', () => ({
  doRestoreOnNewLegalHoldAccount: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';

import { doRestoreOnNewLegalHoldAccount } from '../restore-new-legal-hold-account';

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

const variables = {
  sourceAccountId: 'acc-1',
  destinationAccount: 'lh_admin@test.com',
  date: 1700000000000,
  undeleteDate: null,
  unDelete: false,
  targetServers: 'mailstore1.test.com',
};

describe('useRestoreLegalHoldAccount', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  it('should restore the account and show a success snackbar', async () => {
    vi.mocked(doRestoreOnNewLegalHoldAccount).mockResolvedValue({
      type: 'success',
      operationId: 'op-1',
    });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRestoreLegalHoldAccount(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(doRestoreOnNewLegalHoldAccount).toHaveBeenCalledWith(
      'acc-1',
      'lh_admin@test.com',
      1700000000000,
      null,
      false,
      'mailstore1.test.com',
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['legal-hold'] });
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('should show an error snackbar when restore fails', async () => {
    vi.mocked(doRestoreOnNewLegalHoldAccount).mockResolvedValue({
      type: 'error',
      error: 'Restore failed',
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRestoreLegalHoldAccount(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Restore failed' }),
    );
  });
});
