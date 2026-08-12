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
const mockSetCoreAttributes = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('@zextras/ui-shared', () => ({
  setCoreAttributes: (...args: unknown[]) => mockSetCoreAttributes(...args),
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

import { useModifyBackupConfig } from '../use-modify-backup-config';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useModifyBackupConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls setCoreAttributes with shaped data and shows success snackbar', async () => {
    mockSetCoreAttributes.mockResolvedValue({});

    const { result } = renderHook(() => useModifyBackupConfig(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ ZxBackup_ModuleEnabledAtStartup: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSetCoreAttributes).toHaveBeenCalledWith({
      ZxBackup_ModuleEnabledAtStartup: { value: true, configType: 'global' },
    });
    expect(mockInvalidateQueries).toHaveBeenCalled();
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('shows error snackbar on failure', async () => {
    mockSetCoreAttributes.mockRejectedValue(new Error('Server error'));

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
