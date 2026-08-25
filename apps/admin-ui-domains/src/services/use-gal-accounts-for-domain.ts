/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { Attribute } from '../../types';
import { domainQueryKeys } from './domain-query-keys';
import { getAccount } from './get-account';
import { getDatasource } from './get-datasource-service';

export type GalAccountData = {
  id: string;
  name: string;
  zimbraMailHost?: string;
  zimbraDataSourceGalPollingInterval?: string;
  dataSourceId?: string;
};

async function fetchGalAccounts(accountIds: Array<string>): Promise<Array<GalAccountData>> {
  if (accountIds.length === 0) return [];

  const results: Array<GalAccountData | null> = await Promise.all(
    accountIds.map(async (accountId) => {
      try {
        const response = await getAccount(accountId);
        const account = response?.account?.[0] as
          | { id?: string; name?: string; a?: Array<Attribute> }
          | undefined;
        if (!account?.id || !account.name) return null;

        const attrs = account.a ?? [];
        const attrMap: Record<string, string> = {};
        attrs.forEach((attr: Attribute) => {
          if (!attrMap[attr.n]) {
            attrMap[attr.n] = attr._content ?? '';
          }
        });

        let dataSourceId: string | undefined;
        try {
          const dsResponse = await getDatasource(accountId);
          dataSourceId = dsResponse?.dataSource?.[0]?.id as string | undefined;
        } catch {
          dataSourceId = undefined;
        }

        return {
          id: account.id,
          name: account.name,
          zimbraMailHost: attrMap.zimbraMailHost,
          zimbraDataSourceGalPollingInterval: attrMap.zimbraDataSourceGalPollingInterval,
          dataSourceId,
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((acc): acc is GalAccountData => acc !== null);
}

export function useGalAccountsForDomain(accountIds: Array<string>) {
  return useQuery({
    queryKey: [...domainQueryKeys.gal(), 'accounts', accountIds],
    queryFn: () => fetchGalAccounts(accountIds),
    enabled: accountIds.length > 0,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
