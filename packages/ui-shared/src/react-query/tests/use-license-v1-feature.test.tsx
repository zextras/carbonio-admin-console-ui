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

import { useLicenseV1Feature } from '../use-license-v1-feature';

const LICENSE_INFO_URL = '/services/license/v1/info';

const meteredLicense = {
  licenseType: 'metered',
  status: 'valid',
  companyName: 'Acme Corp',
  partner: 'Zextras Partner',
  orderId: 'ORD-123',
  carbonioVersion: '25.1.2',
  activationToken: 'activation-token',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2027-01-01T00:00:00.000Z',
  totalActiveAccountsNumber: 42,
  lastSyncTime: null,
  lastValidationCheck: '2026-11-16T10:30:00.000Z',
  nextValidationDeadline: '2026-12-16T10:30:00.000Z',
  renewTimeLeft: 30,
  maxTotalSeats: 100,
  addOns: [],
  bundles: [{ name: 'Chats', assignedSeats: 12 }],
};

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

describe('useLicenseV1Feature', () => {
  it('should return true when the license grants the feature', async () => {
    createAPIInterceptor('get', LICENSE_INFO_URL, () => HttpResponse.json(meteredLicense));

    const { result } = renderHook(() => useLicenseV1Feature('Chats'), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it('should return false when the license does not grant the feature', async () => {
    createAPIInterceptor('get', LICENSE_INFO_URL, () => HttpResponse.json(meteredLicense));

    const { result } = renderHook(() => useLicenseV1Feature('Files'), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should return false when no license is installed', async () => {
    createAPIInterceptor('get', LICENSE_INFO_URL, () => HttpResponse.json({}, { status: 404 }));

    const { result } = renderHook(() => useLicenseV1Feature('Chats'), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should surface an error when the request fails', async () => {
    createAPIInterceptor('get', LICENSE_INFO_URL, () => HttpResponse.json({}, { status: 400 }));

    const { result } = renderHook(() => useLicenseV1Feature('Chats'), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
