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

vi.mock('../smart-scan', () => ({
  triggerSmartScan: vi.fn(),
}));

import { triggerSmartScan } from '../smart-scan';
import { useSmartScan } from '../use-smart-scan';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useSmartScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls triggerSmartScan with the server name', async () => {
    vi.mocked(triggerSmartScan).mockResolvedValue({ ok: true } as never);

    const { result } = renderHook(() => useSmartScan(), { wrapper: createWrapper() });

    result.current.mutate('mail.example.com');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(triggerSmartScan).toHaveBeenCalledWith('mail.example.com');
  });

  it('shows error snackbar on failure', async () => {
    vi.mocked(triggerSmartScan).mockRejectedValue(new Error('Scan failed') as never);

    const { result } = renderHook(() => useSmartScan(), { wrapper: createWrapper() });

    result.current.mutate('srv');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Scan failed' }),
    );
  });
});
