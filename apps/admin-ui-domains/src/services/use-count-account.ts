/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { countAccount } from './count-account-service';
import { domainQueryKeys } from './domain-query-keys';

const EXTERNAL_COS_NAME = 'defaultExternal';

type CountAccountCos = { name?: string; _content?: string };

export type CosAccountCount = {
  name: string;
  count: number;
};

function getCountedCoses(res: unknown): Array<CountAccountCos> {
  if (res && typeof res === 'object' && 'cos' in res && res.cos && typeof res.cos === 'object') {
    return Object.values(res.cos);
  }
  return [];
}

export function parseAccountCount(res: unknown): number {
  return getCountedCoses(res)
    .filter((cos) => cos?.name !== EXTERNAL_COS_NAME)
    .reduce((counter, cos) => counter + Number(cos?._content ?? 0), 0);
}

/** Number of accounts of the domain assigned to every COS (external COS excluded). */
export function parseAccountCountByCos(res: unknown): Array<CosAccountCount> {
  return getCountedCoses(res).flatMap((cos) =>
    cos?.name && cos.name !== EXTERNAL_COS_NAME
      ? [{ name: cos.name, count: Number(cos._content ?? 0) }]
      : [],
  );
}

function useCountAccountQuery<T>(domainName: string | undefined, select: (res: unknown) => T) {
  return useQuery({
    queryKey: domainQueryKeys.accountCount.detail(domainName ?? ''),
    queryFn: () => countAccount(domainName!),
    select,
    enabled: !!domainName,
    staleTime: 30_000,
    retry: 1,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export const useCountAccount = (domainName: string | undefined) =>
  useCountAccountQuery(domainName, parseAccountCount);

export const useCountAccountByCos = (domainName: string | undefined) =>
  useCountAccountQuery(domainName, parseAccountCountByCos);
