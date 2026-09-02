/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { useAllConfig } from '@zextras/ui-shared';
import { find } from 'lodash-es';

import { domainQueryKeys } from './domain-query-keys';
import { getAccountRequest } from './get-account';

export type QuarantineAccountData = {
  name: string;
  id: string;
  /** numeric part of zimbraMailMessageLifetime, e.g. '7' for '7d' */
  retentionValue: string;
  /** interval part of zimbraMailMessageLifetime, e.g. 'd' for '7d' */
  retentionInterval: string;
};

const LIFETIME_ATTR = 'zimbraMailMessageLifetime';

export const useQuarantineAccount = () => {
  const { data: config = [] } = useAllConfig();
  const accountName = find(config, { n: 'zimbraAmavisQuarantineAccount' })?._content ?? '';

  return useQuery({
    queryKey: [...domainQueryKeys.quarantineAccount(), accountName],
    queryFn: async (): Promise<QuarantineAccountData> => {
      const res = await getAccountRequest('', accountName, 0);
      const account = res?.account?.[0];
      if (!account?.id) {
        throw new Error(`Quarantine account not found: ${accountName}`);
      }
      const lifetime = find(account.a, { n: LIFETIME_ATTR })?._content;
      return {
        name: accountName,
        id: account.id,
        retentionValue: lifetime?.slice(0, -1) ?? '',
        retentionInterval: lifetime?.slice(-1) ?? '',
      };
    },
    enabled: !!accountName,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
