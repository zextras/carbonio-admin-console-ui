/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_ADMIN_URN } from '../constants';
import { useSnackbar } from '../hooks/useSnackbar';
import { fetchSoap } from '../services/subscription-service';
import { licenseV1QueryKeys } from './use-license-v1-info';
export type LicenseType = 'ISP' | 'Purchased' | 'None';

export type LicenseSubType = 'PERPETUAL' | 'REGULAR' | 'TRIAL';

export type MaintenanceStatus = 'active' | 'expired' | 'expiring' | 'invalid';

type Edition = {
  name: string;
  quantity: string;
};

export type Feature = {
  name: string;
  quantity: string;
  enabled: boolean;
};

export type LicenseInfo = {
  type: LicenseType;
  subType?: LicenseSubType;
  endUser?: string;
  customer?: string;
  company?: string;
  reseller?: boolean;
  order_id?: string;
  renewDaysLeft?: number;
  renewTimeLeft?: number;
  infrastructureId?: string;
  dateStart?: number;
  dateEnd?: number;
  maintenanceEndDate?: number;
  maintenanceStatus?: MaintenanceStatus;
  lastValidationCheck?: number;
  nextValidationDeadline?: number;
  accountCount?: number;
  licensedUsers?: string;
  expired?: boolean;
  notYetValid?: boolean;
  isWithinGraceInterval?: boolean;
  authenticationToken?: string;
  maxCarbonioVersion?: string;
  carbonioVersion?: string;
  updateTime?: number;
  serverID?: string;
  withinSilentWarningInterval?: boolean;
  ispLegacy?: boolean;
  editions?: Array<Edition>;
  features: Array<Feature>;
};

export type LicenseResponse = {
  ok: boolean;
  message?: string;
  response?: LicenseInfo;
};

type VersionResponse = {
  ok: boolean;
  response?: {
    version: string;
  };
};

const queryKeys = {
  all: ['subscription'] as const,
  license: () => [...queryKeys.all, 'license'] as const,
  version: () => [...queryKeys.all, 'version'] as const,
};

const fetchVersion = async (): Promise<VersionResponse> => {
  const res = await fetchSoap('zextras', {
    _jsns: ZIMBRA_ADMIN_URN,
    module: 'ZxCore',
    action: 'getVersion',
  });
  return JSON.parse(res.response.content);
};

const activateLicense = async (token: string, renewal = false): Promise<LicenseResponse> => {
  const res = await fetchSoap('zextras', {
    _jsns: ZIMBRA_ADMIN_URN,
    module: 'ZxCore',
    action: 'activate-license',
    token,
    ...(renewal && { renewal: true }),
  });
  return JSON.parse(res.response.content);
};

const removeLicense = async (): Promise<LicenseResponse> => {
  const res = await fetchSoap('zextras', {
    _jsns: ZIMBRA_ADMIN_URN,
    module: 'ZxCore',
    action: 'doRemoveLicense',
    iamsure: true,
  });
  return JSON.parse(res.response.content);
};

export const useVersion = () => {
  return useQuery({
    queryKey: queryKeys.version(),
    queryFn: fetchVersion,
    retry: 3,
    select: (data) => (data.ok ? data.response?.version : undefined),
  });
};

export function invalidateLicenseQuery(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({ queryKey: licenseV1QueryKeys.all });
}

export const useActivateLicense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, renewal = false }: { token: string; renewal?: boolean }) => {
      const result = await activateLicense(token, renewal);
      if (!result.ok || result.response?.type === 'None') {
        throw new Error(result.message || 'Activation failed');
      }
      return result;
    },
    onSuccess: () => {
      invalidateLicenseQuery(queryClient);
    },
  });
};

export const useRemoveLicense = () => {
  const { t } = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeLicense,
    onSuccess: (data) => {
      if (data.ok) {
        createSnackbar({
          key: '1',
          severity: 'success',
          label:
            data.message ||
            t(
              'core.subscription.license_deactivated_successfully',
              'License deactivated successfully',
            ),
          replace: true,
        });
        invalidateLicenseQuery(queryClient);
      } else {
        createSnackbar({
          key: '1',
          severity: 'error',
          label:
            data.message ||
            t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          replace: true,
        });
      }
    },
    onError: () => {
      createSnackbar({
        key: '1',
        severity: 'error',
        label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        replace: true,
      });
    },
  });
};


