/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  type CoreAttributeRequest,
  getCoreAttributes,
  type GetCoreAttributesResponse,
} from '@zextras/ui-shared';

import { ABQ_MODE, ACCOUNT, BACKUP_ENABLED, BACKUP_SELF_UNDELETE_ALLOWED } from '../constants';
import { domainQueryKeys } from './domain-query-keys';

export type AccountCoreAttributes = {
  abqMode: string | undefined;
  backupEnabled: boolean;
  backupSelfUndeleteAllowed: boolean;
};

export function buildAccountCoreAttributesRequest(
  accountId: string,
): Array<CoreAttributeRequest> {
  return [
    {
      configType: ACCOUNT,
      configName: [accountId],
      attrName: [ABQ_MODE, BACKUP_ENABLED, BACKUP_SELF_UNDELETE_ALLOWED],
    },
  ];
}

export function parseAccountCoreAttributes(res: GetCoreAttributesResponse): AccountCoreAttributes {
  const attributes = res.attributes ?? {};
  return {
    abqMode: attributes[ABQ_MODE]?.[0]?.value || undefined,
    backupEnabled: !!attributes[BACKUP_ENABLED]?.[0]?.value,
    backupSelfUndeleteAllowed: !!attributes[BACKUP_SELF_UNDELETE_ALLOWED]?.[0]?.value,
  };
}

const QUERY_OPTS = {
  staleTime: 30_000,
  retry: 1,
  refetchOnWindowFocus: false,
  placeholderData: keepPreviousData,
} as const;

export const useAccountCoreAttributes = (accountId: string | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.accountCoreAttributes(accountId ?? ''),
    queryFn: async () =>
      parseAccountCoreAttributes(
        await getCoreAttributes(buildAccountCoreAttributesRequest(accountId!)),
      ),
    enabled: !!accountId,
    ...QUERY_OPTS,
  });
