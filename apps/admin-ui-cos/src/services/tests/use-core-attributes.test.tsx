/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCoreAttributes } from '../use-core-attributes';

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('@zextras/ui-shared', async (importOriginal) => ({
  ...(await importOriginal()),
  getCoreAttributes: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';
import { getCoreAttributes } from '@zextras/ui-shared';

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

describe('useCoreAttributes', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  it('should not fetch when body is empty', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCoreAttributes([]), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getCoreAttributes).not.toHaveBeenCalled();
  });

  it('should fetch core attributes when body is provided', async () => {
    const mockResponse = { attributes: { attr1: [{ value: 'val1' }] } };
    vi.mocked(getCoreAttributes).mockResolvedValue(mockResponse);
    const body = [{ configType: 'cos', configName: ['default'], attrName: ['attr1'] }];

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCoreAttributes(body), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getCoreAttributes).toHaveBeenCalledWith(body);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should show error snackbar on failure', async () => {
    vi.mocked(getCoreAttributes).mockRejectedValue(new Error('Fetch failed'));
    const body = [{ configType: 'cos', configName: ['default'], attrName: ['attr1'] }];

    const wrapper = createWrapper();
    renderHook(() => useCoreAttributes(body), { wrapper });

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1), { timeout: 5000 });
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Fetch failed' }),
    );
  });

  it('should show fallback error message when error has no message', async () => {
    vi.mocked(getCoreAttributes).mockRejectedValue(new Error());
    const body = [{ configType: 'cos', configName: ['default'], attrName: ['attr1'] }];

    const wrapper = createWrapper();
    renderHook(() => useCoreAttributes(body), { wrapper });

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1), { timeout: 5000 });
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        label: 'Something went wrong. Please try again.',
      }),
    );
  });
});
