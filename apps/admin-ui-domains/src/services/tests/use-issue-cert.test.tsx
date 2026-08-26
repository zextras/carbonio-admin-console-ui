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

vi.mock('../virtual-host-service', () => ({
  issueCert: vi.fn(),
}));

vi.mock('../verify-cert-key-service', () => ({
  verifyCertKey: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';

import { useIssueCert } from '../use-issue-cert';
import { useVerifyCertKey } from '../use-verify-cert-key';
import { verifyCertKey } from '../verify-cert-key-service';
import { issueCert } from '../virtual-host-service';

const mockCreateSnackbar = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return { wrapper: Wrapper };
}

describe('certificate mutation hooks', () => {
  beforeEach(() => {
    vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
    mockCreateSnackbar.mockClear();
  });

  it('useIssueCert should show the processing snackbar on success', async () => {
    vi.mocked(issueCert).mockResolvedValue({});
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useIssueCert({ domainId: 'dom-1', domainName: 'example.com' }),
      { wrapper },
    );

    result.current.mutate('short');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        label: 'Processing. Results will be notified to global and domain recipients',
      }),
    );
  });

  it('useIssueCert should show an error snackbar on failure', async () => {
    vi.mocked(issueCert).mockRejectedValue(new Error('IssueCert failed'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useIssueCert({ domainId: 'dom-1', domainName: 'example.com' }),
      { wrapper },
    );

    result.current.mutate('short');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'IssueCert failed' }),
    );
  });

  it('useVerifyCertKey should show a valid snackbar when verifyResult is true', async () => {
    vi.mocked(verifyCertKey).mockResolvedValue({ verifyResult: true });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useVerifyCertKey(), { wrapper });

    result.current.mutate({ ca: 'ca', cert: 'cert', privkey: 'key' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        label: 'The certificate is valid',
      }),
    );
  });
});
