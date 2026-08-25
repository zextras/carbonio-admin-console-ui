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
const mockGetAllDevices = vi.fn();
const mockGetMobileDeviceDetail = vi.fn();
const mockDoRemoveDevice = vi.fn();
const mockWipeDevice = vi.fn();
const mockResetDevice = vi.fn();
const mockSuspendDevice = vi.fn();

vi.mock('@zextras/ui-components', () => ({
  useSnackbar: () => mockCreateSnackbar,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../get-all-devices', () => ({
  getAllDevices: (...args: Array<unknown>) => mockGetAllDevices(...args),
}));
vi.mock('../get-mobile-device-detail', () => ({
  getMobileDeviceDetail: (...args: Array<unknown>) => mockGetMobileDeviceDetail(...args),
}));
vi.mock('../do-remove-device', () => ({
  doRemoveDevice: (...args: Array<unknown>) => mockDoRemoveDevice(...args),
}));
vi.mock('../wipe-device', () => ({
  wipeDevice: (...args: Array<unknown>) => mockWipeDevice(...args),
}));
vi.mock('../reset-device', () => ({
  resetDevice: (...args: Array<unknown>) => mockResetDevice(...args),
}));
vi.mock('../suspend-device', () => ({
  suspendDevice: (...args: Array<unknown>) => mockSuspendDevice(...args),
}));

import { domainQueryKeys } from '../domain-query-keys';
import {
  useActiveSyncDeviceStats,
  useActiveSyncDevices,
  useRemoveDevice,
  useResetDevice,
  useSuspendDevice,
  useWipeDevice,
} from '../use-active-sync';

const DEVICE = {
  accountEmail: 'alice@example.com',
  accountName: 'iPhone',
  accountServer: 'mail.example.com',
  deviceId: 'DEV-001',
  deviceType: 'iPhone',
  firstSeen: 1,
  hasMobilePassword: false,
  isOnline: true,
  lastCommandReceived: 1,
  lastPingTimeoutSecs: 300,
  lastSeen: 2,
  protocolVersion: '14.1',
  provisionable: true,
  status: 1,
  userAgent: 'Apple-iPhone/1',
};

function soap(content: unknown): unknown {
  return { Body: { response: { content: JSON.stringify(content) } } };
}

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

describe('use-active-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useActiveSyncDevices', () => {
    it('returns parsed devices when a domain is provided', async () => {
      mockGetAllDevices.mockResolvedValue(
        soap({ response: { a: { response: { devices: [DEVICE] } } } }),
      );
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useActiveSyncDevices('example.com'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.[0]?.deviceId).toBe('DEV-001');
      expect(mockGetAllDevices).toHaveBeenCalledWith('ZxMobile', 'example.com');
    });

    it('does not fetch when domain name is missing', () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useActiveSyncDevices(undefined), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockGetAllDevices).not.toHaveBeenCalled();
    });
  });

  describe('useActiveSyncDeviceStats', () => {
    it('returns parsed statistics for a device', async () => {
      mockGetMobileDeviceDetail.mockResolvedValue(
        soap({ response: { mail: { response: { ...DEVICE, friendlyName: 'Alice' } } } }),
      );
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useActiveSyncDeviceStats({
            accountEmail: 'alice@example.com',
            deviceId: 'DEV-001',
            accountServer: 'mail.example.com',
          }),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.friendlyName).toBe('Alice');
    });
  });

  describe('mutations', () => {
    it('removes a device and invalidates the list', async () => {
      mockDoRemoveDevice.mockResolvedValue(soap({ ok: true }));
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useRemoveDevice(), { wrapper });

      result.current.mutate({ accountName: 'alice@example.com', deviceId: 'DEV-001' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [...domainQueryKeys.all, 'active-sync-devices'],
      });
    });

    it('shows an error snackbar when remove fails', async () => {
      mockDoRemoveDevice.mockResolvedValue(soap({ error: { message: 'Remove failed' } }));
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useRemoveDevice(), { wrapper });

      result.current.mutate({ accountName: 'alice@example.com', deviceId: 'DEV-001' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', label: 'Remove failed' }),
      );
    });

    it('wipes, resets, and suspends a device', async () => {
      mockWipeDevice.mockResolvedValue(soap({ ok: true }));
      mockResetDevice.mockResolvedValue(soap({ ok: true, response: {} }));
      mockSuspendDevice.mockResolvedValue(soap({ ok: true }));
      const { wrapper } = createWrapper();

      const wipe = renderHook(() => useWipeDevice(), { wrapper });
      wipe.result.current.mutate({
        accountName: 'iPhone',
        deviceId: 'DEV-001',
        confirm: true,
      });
      await waitFor(() => expect(wipe.result.current.isSuccess).toBe(true));
      expect(mockWipeDevice).toHaveBeenCalledWith('ZxMobile', 'iPhone', 'DEV-001', true);

      const reset = renderHook(() => useResetDevice(), { wrapper });
      reset.result.current.mutate({ accountName: 'iPhone', deviceId: 'DEV-001' });
      await waitFor(() => expect(reset.result.current.isSuccess).toBe(true));

      const suspend = renderHook(() => useSuspendDevice(), { wrapper });
      suspend.result.current.mutate({ accountName: 'iPhone', deviceId: 'DEV-001' });
      await waitFor(() => expect(suspend.result.current.isSuccess).toBe(true));
    });
  });
});
