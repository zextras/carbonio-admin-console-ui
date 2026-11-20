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

  it('should invalidate the license query on success', async () => {
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
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['license', 'v1-info'],
    });
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: ['subscription', 'license'],
    });
    invalidateSpy.mockRestore();
  });
});

describe('invalidateLicenseQuery', () => {
  it('should invalidate the REST license query key', () => {
    const queryClient = createQueryClient();

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    invalidateLicenseQuery(queryClient);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['license', 'v1-info'],
    });
    expect(invalidateSpy).not.toHaveBeenCalledWith({
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
      queryKey: ['license', 'v1-info'],
    });
    expect(invalidateSpy).not.toHaveBeenCalledWith({
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
