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
const mockGetDistributionListMembership = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../get-distributionlists-membership-service', () => ({
  getDistributionListMembership: (...args: Array<string>) =>
    mockGetDistributionListMembership(...args),
}));

import { useDistributionListMembership } from '../use-distribution-list-membership';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return { wrapper: Wrapper, queryClient };
}

describe('use-distribution-list-membership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the membership when an id is provided', async () => {
    mockGetDistributionListMembership.mockResolvedValue({
      dl: [{ id: 'dl-2', name: 'other@example.com' }],
    });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDistributionListMembership('dl-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.dl?.[0]?.id).toBe('dl-2');
    expect(mockGetDistributionListMembership).toHaveBeenCalledWith('dl-1');
  });

  it('does not fetch when the list id is missing', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDistributionListMembership(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetDistributionListMembership).not.toHaveBeenCalled();
  });

  it('shows an error snackbar when the request fails', async () => {
    mockGetDistributionListMembership.mockRejectedValue(new Error('Membership failed'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDistributionListMembership('dl-1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Membership failed' }),
    );
  });
});
