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

vi.mock('../migrate-volume', () => ({
  migrateVolume: vi.fn(),
}));

import { migrateVolume } from '../migrate-volume';
import { useMigrateVolume } from '../use-migrate-volume';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useMigrateVolume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls migrateVolume and invalidates serverConfig on success', async () => {
    vi.mocked(migrateVolume).mockResolvedValue({ ok: true } as never);

    const { result } = renderHook(() => useMigrateVolume('server-1'), {
      wrapper: createWrapper(),
    });

    const body = { storeType: 'S3', targetServers: ['srv-1'] };
    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(migrateVolume).toHaveBeenCalledWith(body);
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('shows error snackbar on failure', async () => {
    vi.mocked(migrateVolume).mockRejectedValue(new Error('Migration failed') as never);

    const { result } = renderHook(() => useMigrateVolume('server-1'), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ targetServers: ['srv-1'] });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Migration failed' }),
    );
  });
});
