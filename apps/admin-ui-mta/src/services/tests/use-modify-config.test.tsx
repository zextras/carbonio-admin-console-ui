/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModifyConfig } from '../use-modify-config';

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../modify-config', () => ({
  modifyConfig: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';

import { modifyConfig } from '../modify-config';

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

describe('useModifyConfig', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  it('should call modifyConfig and show success snackbar', async () => {
    vi.mocked(modifyConfig).mockResolvedValue({});
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModifyConfig(), { wrapper });

    result.current.mutate([{ n: 'attr', _content: 'TRUE' }]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifyConfig).toHaveBeenCalledWith([{ n: 'attr', _content: 'TRUE' }]);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['all-config'] });
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('should show error snackbar on failure', async () => {
    vi.mocked(modifyConfig).mockRejectedValue(new Error('Modify failed'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useModifyConfig(), { wrapper });

    result.current.mutate([{ n: 'attr', _content: 'TRUE' }]);

    await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Modify failed' }),
    );
  });
});
