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

vi.mock('../purge-backup', () => ({
  triggerBackupPurge: vi.fn(),
}));

import { triggerBackupPurge } from '../purge-backup';
import { usePurgeBackup } from '../use-purge-backup';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('usePurgeBackup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls triggerBackupPurge with the server name', async () => {
    vi.mocked(triggerBackupPurge).mockResolvedValue({ ok: true } as never);

    const { result } = renderHook(() => usePurgeBackup(), { wrapper: createWrapper() });

    result.current.mutate('mail.example.com');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(triggerBackupPurge).toHaveBeenCalledWith('mail.example.com');
  });

  it('shows error snackbar on failure', async () => {
    vi.mocked(triggerBackupPurge).mockRejectedValue(new Error('Purge failed') as never);

    const { result } = renderHook(() => usePurgeBackup(), { wrapper: createWrapper() });

    result.current.mutate('srv');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Purge failed' }),
    );
  });
});
