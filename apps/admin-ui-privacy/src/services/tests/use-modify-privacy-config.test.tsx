/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { SnackbarManagerContext } from '@zextras/ui-shared';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModifyPrivacyConfig } from '../use-modify-privacy-config';

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../modify-privacy-config', () => ({
  modifyPrivacyConfig: vi.fn(),
}));

import { modifyPrivacyConfig } from '../modify-privacy-config';

const mockCreateSnackbar = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <SnackbarManagerContext.Provider value={mockCreateSnackbar}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SnackbarManagerContext.Provider>
  );
  Wrapper.displayName = 'Wrapper';
  return {
    wrapper: Wrapper,
    queryClient,
  };
}

const input = {
  allowFeedback: true,
  sendAnalytics: false,
  sendFullError: true,
};

describe('useModifyPrivacyConfig', () => {
  beforeEach(() => {
    mockCreateSnackbar.mockClear();
  });

  it('should call modifyPrivacyConfig with the provided values on mutate', async () => {
    vi.mocked(modifyPrivacyConfig).mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyPrivacyConfig(), { wrapper });

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifyPrivacyConfig).toHaveBeenCalledWith(input);
  });

  it('should invalidate all-config queries on success', async () => {
    vi.mocked(modifyPrivacyConfig).mockResolvedValue({});

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModifyPrivacyConfig(), { wrapper });

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['all-config'] });
  });

  it('should show success snackbar on success', async () => {
    vi.mocked(modifyPrivacyConfig).mockResolvedValue({});

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyPrivacyConfig(), { wrapper });

    result.current.mutate(input);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        label: 'The change has been saved successfully',
      }),
    );
  });

  it('should show error snackbar on failure', async () => {
    vi.mocked(modifyPrivacyConfig).mockRejectedValue(new Error('Modify failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyPrivacyConfig(), { wrapper });

    result.current.mutate(input);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Modify failed' }),
    );
  });

  it('should show fallback error message when error has no message', async () => {
    vi.mocked(modifyPrivacyConfig).mockRejectedValue(new Error());

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyPrivacyConfig(), { wrapper });

    result.current.mutate(input);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Something went wrong. Please try again.',
      }),
    );
  });
});
