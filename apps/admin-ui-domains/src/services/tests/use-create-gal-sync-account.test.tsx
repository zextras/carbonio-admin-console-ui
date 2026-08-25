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

vi.mock('../create-gal-sync-service', () => ({
  createGalSyncAccount: vi.fn(),
}));

vi.mock('@zextras/ui-shared', () => ({
  domainByIdKey: (domainId: string, applyConfig = 1) => ['domain', 'by-id', domainId, applyConfig],
}));

import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey } from '@zextras/ui-shared';

import { createGalSyncAccount } from '../create-gal-sync-service';
import { domainQueryKeys } from '../domain-query-keys';
import { useCreateGalSyncAccount } from '../use-create-gal-sync-account';

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

describe('useCreateGalSyncAccount', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  const vars = {
    name: 'galsync@domain.com',
    domainName: 'domain.com',
    server: 'server-1',
    account: [{ by: 'name', _content: 'galsync@domain.com' }],
    type: 'zimbra',
  };

  it('should call createGalSyncAccount with the provided vars', async () => {
    vi.mocked(createGalSyncAccount).mockResolvedValue({ account: { id: 'acc-1' } });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateGalSyncAccount('domain-1'), { wrapper });

    result.current.mutate(vars);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createGalSyncAccount).toHaveBeenCalledWith(
      vars.name,
      vars.domainName,
      vars.server,
      vars.account,
      vars.type,
      undefined,
      undefined
    );
  });

  it('should invalidate gal and domain caches on success', async () => {
    vi.mocked(createGalSyncAccount).mockResolvedValue({ account: { id: 'acc-1' } });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateGalSyncAccount('domain-1'), { wrapper });

    result.current.mutate(vars);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.gal() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainByIdKey('domain-1', 1) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainByIdKey('domain-1', 0) });
  });

  it('should show a success snackbar on success', async () => {
    vi.mocked(createGalSyncAccount).mockResolvedValue({ account: { id: 'acc-1' } });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateGalSyncAccount('domain-1'), { wrapper });

    result.current.mutate(vars);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        label: 'You have created the GALSync account name',
      })
    );
  });

  it('should show an error snackbar on failure', async () => {
    vi.mocked(createGalSyncAccount).mockRejectedValue(new Error('Creation failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateGalSyncAccount('domain-1'), { wrapper });

    result.current.mutate(vars);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Creation failed',
      })
    );
  });
});
