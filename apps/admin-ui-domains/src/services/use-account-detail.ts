/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getAccountRequest } from './get-account';

export type FlattenedAccount = Record<string, any>;

export function flattenAccountAttrs(
  a?: Array<{ n: string; _content: string }>,
): FlattenedAccount {
  const obj: FlattenedAccount = {};
  a?.forEach((ele) => {
    if (obj[ele.n]) {
      obj[ele.n] = `${obj[ele.n]}, ${ele._content}`;
    } else {
      obj[ele.n] = ele._content;
    }
  });
  return obj;
}

export function parseAccountDetail(res: any): FlattenedAccount {
  const account = res?.account?.[0];
  const obj = flattenAccountAttrs(account?.a);
  if (obj.userPassword) {
    obj.password = '******';
    obj.repeatPassword = '******';
  } else {
    obj.password = '';
    obj.repeatPassword = '';
  }
  obj.zimbraPrefMailForwardingAddress = obj.zimbraPrefMailForwardingAddress ?? '';
  obj.zimbraPrefCalendarForwardInvitesTo = obj.zimbraPrefCalendarForwardInvitesTo ?? '';
  obj.zimbraId = account?.id;
  obj.name = account?.name;
  if (obj.zimbraIsAdminAccount === undefined) {
    obj.zimbraIsAdminAccount = 'FALSE';
  }
  if (obj.zimbraIsDelegatedAdminAccount === undefined) {
    obj.zimbraIsDelegatedAdminAccount = 'FALSE';
  }
  return obj;
}

export function parseSpecificAttrs(res: any): FlattenedAccount {
  return flattenAccountAttrs(res?.account?.[0]?.a);
}

const QUERY_OPTS = {
  staleTime: 30_000,
  retry: 1,
  refetchOnWindowFocus: false,
  placeholderData: keepPreviousData,
} as const;

export const useAccountDetail = (accountId: string | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.accountDetail(accountId ?? ''),
    queryFn: async () => parseAccountDetail(await getAccountRequest(accountId!, '', 1)),
    enabled: !!accountId,
    ...QUERY_OPTS,
  });

export const useAccountSpecificDetail = (accountId: string | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.accountSpecificDetail(accountId ?? ''),
    queryFn: async () => parseSpecificAttrs(await getAccountRequest(accountId!, '', 0)),
    enabled: !!accountId,
    ...QUERY_OPTS,
  });
