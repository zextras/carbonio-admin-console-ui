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
  lastSuccessfulSync?: string;
  galStatus?: string;
};

type GalDataSourceInfo = {
  dataSourceId?: string;
  lastSuccessfulSync?: string;
  galStatus?: string;
};

async function fetchGalDataSourceInfo(accountId: string): Promise<GalDataSourceInfo> {
  try {
    const dsResponse = await getDatasource(accountId);
    const dataSource = dsResponse?.dataSource?.[0] as
      | { id?: string; _attrs?: Record<string, string | undefined> }
      | undefined;
    return {
      dataSourceId: dataSource?.id,
      lastSuccessfulSync: dataSource?._attrs?.zimbraGalLastSuccessfulSyncTimestamp,
      galStatus: dataSource?._attrs?.zimbraGalStatus,
    };
  } catch {
    return {};
  }
}

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

        const dataSourceInfo = await fetchGalDataSourceInfo(accountId);

        return {
          id: account.id,
          name: account.name,
          zimbraMailHost: attrMap.zimbraMailHost,
          zimbraDataSourceGalPollingInterval: attrMap.zimbraDataSourceGalPollingInterval,
          ...dataSourceInfo,
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
    placeholderData: accountIds.length > 0 ? keepPreviousData : undefined,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
