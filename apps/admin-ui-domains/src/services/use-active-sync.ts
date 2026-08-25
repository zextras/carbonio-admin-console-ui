/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { ZX_MOBILE } from '../constants';
import { doRemoveDevice } from './do-remove-device';
import { domainQueryKeys } from './domain-query-keys';
import { getAllDevices } from './get-all-devices';
import { getMobileDeviceDetail } from './get-mobile-device-detail';
import {
  parseAllDevices,
  parseDeviceStatistics,
  parseZextrasActionResult,
  soapErrorMessage,
} from './parse-active-sync';
import { resetDevice } from './reset-device';
import { suspendDevice } from './suspend-device';
import { wipeDevice } from './wipe-device';

const FALLBACK_ERROR = 'Something went wrong. Please try again.';

type DeviceActionInput = {
  accountName: string;
  deviceId: string;
};

type WipeDeviceInput = DeviceActionInput & {
  confirm: boolean;
};

type DeviceStatsParams = {
  accountEmail: string;
  deviceId: string;
  accountServer: string;
};

function useActiveSyncSnackbar() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  function success(label: string): void {
    createSnackbar({
      key: 'success',
      severity: 'success',
      label,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  }

  function error(err: unknown): void {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: soapErrorMessage(err, t('label.something_wrong_error_msg', FALLBACK_ERROR)),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  }

  return { t, success, error };
}

async function assertZextrasOk(res: unknown, fallback: string): Promise<void> {
  const result = parseZextrasActionResult(res);
  if (!result.ok) {
    throw new Error(result.message ?? fallback);
  }
}

export function useActiveSyncDevices(domainName: string | undefined) {
  const { t, error } = useActiveSyncSnackbar();

  return useQuery({
    queryKey: domainQueryKeys.activeSyncDevices(domainName ?? ''),
    queryFn: async () => {
      try {
        return parseAllDevices(await getAllDevices(ZX_MOBILE, domainName ?? ''));
      } catch (err) {
        error(err);
        throw err instanceof Error
          ? err
          : new Error(t('label.something_wrong_error_msg', FALLBACK_ERROR));
      }
    },
    enabled: !!domainName,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useActiveSyncDeviceStats(params: DeviceStatsParams | undefined) {
  const { t, error } = useActiveSyncSnackbar();
  const accountEmail = params?.accountEmail ?? '';
  const deviceId = params?.deviceId ?? '';

  return useQuery({
    queryKey: domainQueryKeys.activeSyncDeviceStats(accountEmail, deviceId),
    queryFn: async () => {
      try {
        return parseDeviceStatistics(
          await getMobileDeviceDetail(ZX_MOBILE, accountEmail, deviceId, params?.accountServer ?? ''),
        );
      } catch (err) {
        error(err);
        throw err instanceof Error
          ? err
          : new Error(t('label.something_wrong_error_msg', FALLBACK_ERROR));
      }
    },
    enabled: !!params?.accountEmail && !!params?.deviceId,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

function useInvalidateActiveSyncDevices() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: [...domainQueryKeys.all, 'active-sync-devices'] });
}

export function useRemoveDevice() {
  const { t, success, error } = useActiveSyncSnackbar();
  const invalidate = useInvalidateActiveSyncDevices();

  return useMutation({
    mutationFn: async ({ accountName, deviceId }: DeviceActionInput) => {
      const res = await doRemoveDevice(accountName, deviceId);
      await assertZextrasOk(res, t('label.something_wrong_error_msg', FALLBACK_ERROR));
    },
    onSuccess: () => {
      success(t('label.remove_device_success_message', 'Device remove successfully'));
      invalidate();
    },
    onError: (err: unknown) => error(err),
  });
}

export function useWipeDevice() {
  const { t, success, error } = useActiveSyncSnackbar();
  const invalidate = useInvalidateActiveSyncDevices();

  return useMutation({
    mutationFn: async ({ accountName, deviceId, confirm }: WipeDeviceInput) => {
      const res = await wipeDevice(ZX_MOBILE, accountName, deviceId, confirm);
      await assertZextrasOk(res, t('label.something_wrong_error_msg', FALLBACK_ERROR));
    },
    onSuccess: () => {
      success(t('label.change_save_success_msg', 'The change has been saved successfully'));
      invalidate();
    },
    onError: (err: unknown) => error(err),
  });
}

export function useResetDevice() {
  const { t, success, error } = useActiveSyncSnackbar();
  const invalidate = useInvalidateActiveSyncDevices();

  return useMutation({
    mutationFn: async ({ accountName, deviceId }: DeviceActionInput) => {
      const res = await resetDevice(ZX_MOBILE, accountName, deviceId);
      await assertZextrasOk(res, t('label.something_wrong_error_msg', FALLBACK_ERROR));
    },
    onSuccess: () => {
      success(t('label.change_save_success_msg', 'The change has been saved successfully'));
      invalidate();
    },
    onError: (err: unknown) => error(err),
  });
}

export function useSuspendDevice() {
  const { t, success, error } = useActiveSyncSnackbar();
  const invalidate = useInvalidateActiveSyncDevices();

  return useMutation({
    mutationFn: async ({ accountName, deviceId }: DeviceActionInput) => {
      const res = await suspendDevice(ZX_MOBILE, accountName, deviceId);
      await assertZextrasOk(res, t('label.something_wrong_error_msg', FALLBACK_ERROR));
    },
    onSuccess: () => {
      success(t('label.change_save_success_msg', 'The change has been saved successfully'));
      invalidate();
    },
    onError: (err: unknown) => error(err),
  });
}
