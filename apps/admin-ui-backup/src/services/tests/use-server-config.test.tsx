/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../get-server-config', () => ({
  getServerConfig: vi.fn(),
}));

import { getServerConfig } from '../get-server-config';
import { useServerConfig } from '../use-server-config';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useServerConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is disabled when serverId is undefined', () => {
    const { result } = renderHook(() => useServerConfig(undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('fetches server config when serverId is provided', async () => {
    const mockData = { attributes: { ZxBackup_ModuleEnabledAtStartup: { value: true } } };
    vi.mocked(getServerConfig).mockResolvedValue(mockData as never);

    const { result } = renderHook(() => useServerConfig('server-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getServerConfig).toHaveBeenCalledWith('server-1');
    expect(result.current.data).toEqual(mockData);
  });
});
