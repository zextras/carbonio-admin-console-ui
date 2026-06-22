/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModifyCos } from '../use-modify-cos';

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../modify-cos-service', () => ({
  modifyCos: vi.fn(),
}));

vi.mock('@zextras/ui-shared', async (importOriginal) => ({
  ...(await importOriginal()),
  flushCache: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';
import { flushCache } from '@zextras/ui-shared';

import { modifyCos } from '../modify-cos-service';

const mockCreateSnackbar = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return {
    wrapper: Wrapper,
    queryClient,
  };
}

describe('useModifyCos', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  const body = {
    _jsns: 'urn:zimbraAdmin',
    id: { _content: 'cos-1' },
    a: [{ n: 'zimbraPrefLocale', _content: 'en_US' }],
  };

  it('should call modifyCos with the provided body on mutate', async () => {
    const mockResponse = { cos: [{ id: 'cos-1', name: 'default' }] };
    vi.mocked(modifyCos).mockResolvedValue(mockResponse);
    vi.mocked(flushCache).mockResolvedValue(undefined);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyCos('cos-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifyCos).toHaveBeenCalledWith(body);
  });

  it('should flush cache on success', async () => {
    vi.mocked(modifyCos).mockResolvedValue({ cos: [] });
    vi.mocked(flushCache).mockResolvedValue(undefined);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyCos('cos-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(flushCache).toHaveBeenCalledWith('cos', 'id', 'cos-1');
  });

  it('should show success snackbar on success', async () => {
    vi.mocked(modifyCos).mockResolvedValue({ cos: [] });
    vi.mocked(flushCache).mockResolvedValue(undefined);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyCos('cos-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('should show error snackbar on failure', async () => {
    vi.mocked(modifyCos).mockRejectedValue(new Error('Modify failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyCos('cos-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Modify failed' }),
    );
  });

  it('should show fallback error message when error has no message', async () => {
    vi.mocked(modifyCos).mockRejectedValue(new Error());

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyCos('cos-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Something went wrong. Please try again.',
      }),
    );
  });

  it('should not invalidate detail queries when cosId is not provided', async () => {
    vi.mocked(modifyCos).mockResolvedValue({ cos: [] });
    vi.mocked(flushCache).mockResolvedValue(undefined);

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModifyCos(), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('should invalidate detail queries when cosId is provided', async () => {
    vi.mocked(modifyCos).mockResolvedValue({ cos: [] });
    vi.mocked(flushCache).mockResolvedValue(undefined);

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModifyCos('cos-1'), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['cos', 'detail', 'cos-1'],
    });
  });
});
