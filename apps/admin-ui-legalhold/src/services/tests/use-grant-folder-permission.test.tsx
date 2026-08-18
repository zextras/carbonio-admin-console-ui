/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useGrantFolderPermission } from '../use-grant-folder-permission';

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../grant-folder-permission', () => ({
  grantFolderPermissions: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';

import { grantFolderPermissions } from '../grant-folder-permission';

const mockCreateSnackbar = vi.fn();

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

describe('useGrantFolderPermission', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  const variables = {
    accounts: [{ id: 'usr-1', name: 'lawyer@test.com', a: [], type: 'usr' }],
    targetAccountId: 'restored-id',
  };

  it('should grant permissions and show a success snackbar', async () => {
    vi.mocked(grantFolderPermissions).mockResolvedValue({ type: 'success' });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGrantFolderPermission(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(grantFolderPermissions).toHaveBeenCalledWith(variables.accounts, 'restored-id');
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('should show an error snackbar when the grant fails', async () => {
    vi.mocked(grantFolderPermissions).mockResolvedValue({ type: 'error', error: 'Grant failed' });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGrantFolderPermission(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Grant failed' }),
    );
  });
});
