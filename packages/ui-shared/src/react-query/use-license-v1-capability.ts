/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { fetchLicenseV1Capability } from '../services/license-capability-service';
import { LicenseV1QueryError, licenseV1Retry } from './use-license-v1-info';

export const licenseV1CapabilityQueryKeys = {
  all: ['license', 'v1-capability'] as const,
  capability: (capability: string, accountId?: string) =>
    [...licenseV1CapabilityQueryKeys.all, capability, accountId ?? null] as const,
};

export const queryFnLicenseV1Capability = async (
  capability: string,
  accountId?: string,
): Promise<boolean> => {
  const result = await fetchLicenseV1Capability(capability, accountId);
  if (result.type === 'success') {
    return result.allowed;
  }
  throw new LicenseV1QueryError(result.error);
};

type UseLicenseV1CapabilityOptions = Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'> & {
  enabled?: boolean;
};

export const useLicenseV1Capability = (
  capability: string,
  accountId?: string,
  options?: UseLicenseV1CapabilityOptions,
) =>
  useQuery({
    queryKey: licenseV1CapabilityQueryKeys.capability(capability, accountId),
    queryFn: () => queryFnLicenseV1Capability(capability, accountId),
    retry: licenseV1Retry,
    ...options,
  });
