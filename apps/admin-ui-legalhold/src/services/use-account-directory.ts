/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { RECORD_DISPLAY_LIMIT } from '../constants';
import { accountListDirectory } from './account-list-directory-service';
import { legalHoldQueryKeys } from './legal-hold-query-keys';

function buildAccountSearchQuery(searchStr: string): string {
  return `(|(mail=*${searchStr}*)(cn=*${searchStr}*)(sn=*${searchStr}*)(gn=*${searchStr}*)(displayName=*${searchStr}*)(zimbraMailDeliveryAddress=*${searchStr}*))`;
}

export function useAccountDirectory(searchStr: string, excludeAccountId = '') {
  return useQuery({
    queryKey: legalHoldQueryKeys.accountDirectory(searchStr, excludeAccountId),
    queryFn: async () => {
      const result = await accountListDirectory({
        attr: 'displayName,zimbraId',
        type: 'distributionlists,accounts',
        domainName: '',
        query: searchStr === '' ? '' : buildAccountSearchQuery(searchStr),
        offset: 0,
        limit: RECORD_DISPLAY_LIMIT,
        excludeAccountId,
      });
      if (result.type === 'error') {
        throw new Error(result.error);
      }
      return result.accounts;
    },
    enabled: searchStr !== '',
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
