/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { getSetupServer } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import React from 'react';

import {
  invalidateLicenseQuery,
  useActivateLicense,
  useLicenseInfo,
  useModuleLicenseInfo,
  useRemoveLicense,
  useVersion,
} from '../use-subscription';

type SoapBody = {
  Body: {
    zextras: {
      action: string;
      token?: string;
      renewal?: boolean;
      [key: string]: unknown;
    };
  };
};

function createSoapResponse(content: Record<string, unknown>) {
  return HttpResponse.json({
    Body: {
      response: {
        content: JSON.stringify(content),
      },
    },
  });
}

function interceptSoapAction(
  action: string,
  responseFactory: () => ReturnType<typeof HttpResponse.json>,
) {
  const requests: Array<SoapBody> = [];
  getSetupServer().use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as SoapBody;
      if (body?.Body?.zextras?.action === action) {
        requests.push(body);
        return responseFactory();
      }
      return HttpResponse.json({}, { status: 404 });
    }),
  );
  return { getRequests: () => requests };
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useLicenseInfo', () => {
  it('should fetch and return license data', async () => {
    const licenseData = {
      ok: true,
      response: {
        type: 'Purchased',
        subType: 'REGULAR',
        expired: false,
        accountCount: 7,
        licensedUsers: '99',
        features: [],
      },
    };
    interceptSoapAction('getLicenseInfo', () => createSoapResponse(licenseData));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.ok).toBe(true);
    expect(result.current.data?.response?.type).toBe('Purchased');
    expect(result.current.data?.response?.subType).toBe('REGULAR');
    expect(result.current.data?.response?.accountCount).toBe(7);
  });

  it('should return null when response has type None', async () => {
    interceptSoapAction('getLicenseInfo', () =>
      createSoapResponse({
        ok: true,
        response: { type: 'None', features: [] },
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('should return null when ok is false', async () => {
    interceptSoapAction('getLicenseInfo', () => createSoapResponse({ ok: false }));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('should return null when response is missing', async () => {
    interceptSoapAction('getLicenseInfo', () => createSoapResponse({ ok: true }));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useVersion', () => {
  it('should fetch and return the version string', async () => {
    interceptSoapAction('getVersion', () =>
      createSoapResponse({ ok: true, response: { version: '24.7.0' } }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useVersion(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe('24.7.0');
  });

  it('should return undefined when ok is false', async () => {
    interceptSoapAction('getVersion', () => createSoapResponse({ ok: false }));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useVersion(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe('useActivateLicense', () => {
  it('should call activate-license API with the provided token', async () => {
    const activationResponse = {
      ok: true,
      response: { type: 'Purchased', subType: 'REGULAR', features: [] },
    };
    const { getRequests } = interceptSoapAction('activate-license', () =>
      createSoapResponse(activationResponse),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useActivateLicense(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ token: 'MY-LICENSE-TOKEN' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getRequests()).toHaveLength(1);
    expect(getRequests()[0].Body.zextras.token).toBe('MY-LICENSE-TOKEN');
  });

  it('should pass renewal flag when specified', async () => {
    const activationResponse = {
      ok: true,
      response: { type: 'Purchased', subType: 'REGULAR', features: [] },
    };
    const { getRequests } = interceptSoapAction('activate-license', () =>
      createSoapResponse(activationResponse),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useActivateLicense(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ token: 'RENEW-TOKEN', renewal: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getRequests()[0].Body.zextras.renewal).toBe(true);
  });

  it('should throw when API returns ok:false', async () => {
    interceptSoapAction('activate-license', () =>
      createSoapResponse({ ok: false, message: 'Invalid token' }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useActivateLicense(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ token: 'BAD-TOKEN' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Invalid token');
  });

  it('should throw when API returns type None', async () => {
    interceptSoapAction('activate-license', () =>
      createSoapResponse({
        ok: true,
        response: { type: 'None', features: [] },
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useActivateLicense(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ token: 'NONE-TOKEN' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Activation failed');
  });

  it('should not automatically invalidate the license query on success', async () => {
    interceptSoapAction('getLicenseInfo', () => createSoapResponse({ ok: false }));
    interceptSoapAction('activate-license', () =>
      createSoapResponse({
        ok: true,
        response: { type: 'Purchased', subType: 'REGULAR', features: [] },
      }),
    );

    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useActivateLicense(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ token: 'TOKEN' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
    invalidateSpy.mockRestore();
  });
});

describe('invalidateLicenseQuery', () => {
  it('should invalidate the license query key', async () => {
    interceptSoapAction('getLicenseInfo', () =>
      createSoapResponse({
        ok: true,
        response: { type: 'Purchased', subType: 'REGULAR', features: [] },
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    invalidateLicenseQuery(queryClient);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['subscription', 'license'],
    });
    invalidateSpy.mockRestore();
  });
});

describe('useRemoveLicense', () => {
  it('should call doRemoveLicense API and invalidate license query on success', async () => {
    interceptSoapAction('doRemoveLicense', () =>
      createSoapResponse({ ok: true, message: 'License removed' }),
    );

    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRemoveLicense(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['subscription', 'license'],
    });
    invalidateSpy.mockRestore();
  });

  it('should not invalidate license query when API returns ok:false', async () => {
    interceptSoapAction('doRemoveLicense', () =>
      createSoapResponse({ ok: false, message: 'Removal failed' }),
    );

    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRemoveLicense(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
    invalidateSpy.mockRestore();
  });
});

describe('useModuleLicenseInfo', () => {
  it('should return module license info from license data', async () => {
    interceptSoapAction('getLicenseInfo', () =>
      createSoapResponse({
        ok: true,
        response: {
          type: 'Purchased',
          subType: 'REGULAR',
          expired: false,
          maintenanceEndDate: 1750000000000,
          maintenanceStatus: 'active',
          features: [{ name: 'backup_realtime', quantity: 'unlimited', enabled: true }],
          updateTime: 1700000000000,
          maxCarbonioVersion: '24.12.0',
          carbonioVersion: '24.7.0',
        },
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useModuleLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.moduleLicenseInfo).not.toBeNull());
    expect(result.current.moduleLicenseInfo?.subType).toBe('REGULAR');
    expect(result.current.moduleLicenseInfo?.maintenanceStatus).toBe('active');
    expect(result.current.moduleLicenseInfo?.features).toHaveLength(1);
  });

  it('should return null when no license data', async () => {
    interceptSoapAction('getLicenseInfo', () => createSoapResponse({ ok: false }));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useModuleLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.moduleLicenseInfo).toBeNull());
  });

  it('should override maintenanceStatus to invalid for expired perpetual licenses', async () => {
    interceptSoapAction('getLicenseInfo', () =>
      createSoapResponse({
        ok: true,
        response: {
          type: 'Purchased',
          subType: 'PERPETUAL',
          expired: true,
          maintenanceStatus: 'active',
          features: [],
        },
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useModuleLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.moduleLicenseInfo).not.toBeNull());
    expect(result.current.moduleLicenseInfo?.maintenanceStatus).toBe('invalid');
  });

  it('should not show license banner for active perpetual licenses', async () => {
    interceptSoapAction('getLicenseInfo', () =>
      createSoapResponse({
        ok: true,
        response: {
          type: 'Purchased',
          subType: 'PERPETUAL',
          expired: false,
          maintenanceStatus: 'active',
          features: [],
        },
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useModuleLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.moduleLicenseInfo).not.toBeNull());
    expect(result.current.licenseBannerShouldBeDisplayed).toBe(false);
  });

  it('should show license banner for perpetual license with non-active maintenance', async () => {
    interceptSoapAction('getLicenseInfo', () =>
      createSoapResponse({
        ok: true,
        response: {
          type: 'Purchased',
          subType: 'PERPETUAL',
          expired: false,
          maintenanceStatus: 'expired',
          features: [],
        },
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useModuleLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.moduleLicenseInfo).not.toBeNull());
    expect(result.current.licenseBannerShouldBeDisplayed).toBe(true);
  });

  it('should hide license banner after setIsLicenseBannerOpen(false)', async () => {
    interceptSoapAction('getLicenseInfo', () =>
      createSoapResponse({
        ok: true,
        response: {
          type: 'Purchased',
          subType: 'PERPETUAL',
          expired: false,
          maintenanceStatus: 'expired',
          features: [],
        },
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useModuleLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.licenseBannerShouldBeDisplayed).toBe(true));

    act(() => {
      result.current.setIsLicenseBannerOpen(false);
    });

    expect(result.current.licenseBannerShouldBeDisplayed).toBe(false);
  });

  it('should not show license banner for non-perpetual licenses', async () => {
    interceptSoapAction('getLicenseInfo', () =>
      createSoapResponse({
        ok: true,
        response: {
          type: 'Purchased',
          subType: 'REGULAR',
          expired: false,
          maintenanceStatus: 'expired',
          features: [],
        },
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useModuleLicenseInfo(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.moduleLicenseInfo).not.toBeNull());
    expect(result.current.licenseBannerShouldBeDisplayed).toBe(false);
  });
});
