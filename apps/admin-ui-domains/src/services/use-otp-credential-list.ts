/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQuery } from '@tanstack/react-query';
import { useIsAdvanced } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN } from '../constants';
import { domainQueryKeys } from './domain-query-keys';
import { fetchSoap } from './listOTP-service';

const QUERY_OPTS = { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } as const;

export type OtpEntry = {
  id: string;
  label?: string;
  enabled?: boolean;
  failed_attempts?: number;
  created?: string;
  description?: string;
};

export const useOtpList = (accountName: string | undefined) => {
  const isAdvanced = useIsAdvanced();
  return useQuery({
    queryKey: domainQueryKeys.otpList(accountName ?? ''),
    queryFn: async () => {
      const res = await fetchSoap('zextras', {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxAuth',
        action: 'list_totp_command',
        account: `${accountName}`,
      });
      return (res?.response?.list ?? []) as Array<OtpEntry>;
    },
    enabled: isAdvanced && !!accountName,
    ...QUERY_OPTS,
  });
};

export const useCredentialList = (accountName: string | undefined) => {
  const isAdvanced = useIsAdvanced();
  return useQuery({
    queryKey: domainQueryKeys.credentialList(accountName ?? ''),
    queryFn: async () => {
      const res = await fetchSoap('zextras', {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxAuth',
        action: 'credential',
        request: 'list',
        account: `${accountName}`,
      });
      return (res?.response?.values ?? []) as Array<any>;
    },
    enabled: isAdvanced && !!accountName,
    ...QUERY_OPTS,
  });
};
