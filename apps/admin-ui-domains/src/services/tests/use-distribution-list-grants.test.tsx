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
const mockGetGrant = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../get-grant', () => ({
  getGrant: (...args: Array<Record<string, unknown>>) => mockGetGrant(...args),
}));

import {
  buildDistributionListGrantsRequest,
  useDistributionListGrants,
} from '../use-distribution-list-grants';

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

describe('use-distribution-list-grants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildDistributionListGrantsRequest', () => {
    it('builds a request targeting the distribution list by id', () => {
      expect(buildDistributionListGrantsRequest('dl-1')).toEqual({
        target: {
          type: 'dl',
          by: 'id',
          _content: 'dl-1',
        },
      });
    });
  });

  it('returns grants when an id is provided', async () => {
    mockGetGrant.mockResolvedValue({ grant: [] });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDistributionListGrants('dl-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ grant: [] });
    expect(mockGetGrant).toHaveBeenCalledWith(buildDistributionListGrantsRequest('dl-1'));
  });

  it('does not fetch when the list id is missing', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDistributionListGrants(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetGrant).not.toHaveBeenCalled();
  });

  it('shows an error snackbar when the request fails', async () => {
    mockGetGrant.mockRejectedValue(new Error('Grants failed'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDistributionListGrants('dl-1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockCreateSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', label: 'Grants failed' }),
    );
  });
});
