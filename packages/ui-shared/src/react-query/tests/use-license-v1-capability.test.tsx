/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';

import { useLicenseV1Capability } from '../use-license-v1-capability';

const CAPABILITY_URL = '/services/license/v1/capabilities/allowed?capability=REAL_TIME_BACKUP';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useLicenseV1Capability', () => {
  it('should return the allowed value as data', async () => {
    createAPIInterceptor('get', CAPABILITY_URL, () => HttpResponse.json({ allowed: true }));
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useLicenseV1Capability('REAL_TIME_BACKUP'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it('should return false as data when the capability is not allowed', async () => {
    createAPIInterceptor('get', CAPABILITY_URL, () => HttpResponse.json({ allowed: false }));
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useLicenseV1Capability('REAL_TIME_BACKUP'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should surface an error when the request fails', async () => {
    createAPIInterceptor('get', CAPABILITY_URL, () =>
      HttpResponse.json({}, { status: 500 }),
    );
    const queryClient = createQueryClient();

    const { result } = renderHook(
      () => useLicenseV1Capability('REAL_TIME_BACKUP', undefined, { retry: false }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
