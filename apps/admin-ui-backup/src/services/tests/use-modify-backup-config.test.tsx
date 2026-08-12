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
const mockInvalidateQueries = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key, { i18n: {} }],
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

vi.mock('../modify-backup', () => ({
  modifyBackupRequest: vi.fn(),
}));

import { modifyBackupRequest } from '../modify-backup';
import { useModifyBackupConfig } from '../use-modify-backup-config';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useModifyBackupConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls modifyBackupRequest and shows success snackbar on success', async () => {
    vi.mocked(modifyBackupRequest).mockResolvedValue({} as never);

    const { result } = renderHook(() => useModifyBackupConfig(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ ZxBackup_ModuleEnabledAtStartup: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifyBackupRequest).toHaveBeenCalledWith({ ZxBackup_ModuleEnabledAtStartup: true });
    expect(mockInvalidateQueries).toHaveBeenCalled();
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('shows error snackbar on failure', async () => {
    vi.mocked(modifyBackupRequest).mockRejectedValue(new Error('Server error') as never);

    const { result } = renderHook(() => useModifyBackupConfig(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ foo: 'bar' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Server error' }),
    );
  });
});
