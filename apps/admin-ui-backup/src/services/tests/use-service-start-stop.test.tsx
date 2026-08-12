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

vi.mock('../service-start-stop', () => ({
  serviceStartStop: vi.fn(),
}));

import { serviceStartStop } from '../service-start-stop';
import { useServiceStartStop } from '../use-service-start-stop';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useServiceStartStop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls serviceStartStop and invalidates serverConfig on success', async () => {
    vi.mocked(serviceStartStop).mockResolvedValue({ Body: { response: { content: '' } } } as never);

    const { result } = renderHook(() => useServiceStartStop('server-1'), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ action: 'doStartService', server: 'mail.example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(serviceStartStop).toHaveBeenCalledWith({
      action: 'doStartService',
      server: 'mail.example.com',
    });
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('shows error snackbar on failure', async () => {
    vi.mocked(serviceStartStop).mockRejectedValue(new Error('Network error') as never);

    const { result } = renderHook(() => useServiceStartStop('server-1'), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ action: 'doStopService', server: 'srv' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Network error' }),
    );
  });
});
