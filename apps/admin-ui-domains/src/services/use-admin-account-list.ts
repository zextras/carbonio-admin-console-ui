/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { accountListDirectory } from './account-list-directory-service';
import { domainQueryKeys } from './domain-query-keys';

const ADMIN_ACCOUNT_SEARCH_QUERY =
  '(|(&(zimbraIsAdminAccount=TRUE))(&(zimbraIsDelegatedAdminAccount=TRUE)(!(zimbraIsAdminAccount=TRUE))))';

const ADMIN_ACCOUNT_ATTRS =
  'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraCreateTimestamp,zimbraMailQuota,zimbraNotes,mail';

export type AdminAccountListResult = {
  accounts: Array<Record<string, any>>;
  total: number;
};

const flattenAttrs = (item: any): Record<string, any> => {
  item?.a?.forEach((ele: any) => {
    if (ele?.n === 'mail') {
      if (item[ele?.n]) {
        item[ele?.n].push(ele._content);
      } else {
        item[ele?.n] = [ele._content];
      }
    } else {
      item[ele?.n] = ele._content;
    }
  });
  return item;
};

export const adminAccountListQueryKeys = {
  all: [...domainQueryKeys.all, 'admin-account-list'] as const,
};

export const useAdminAccountList = (offset: number, limit: number) =>
  useQuery({
    queryKey: [...adminAccountListQueryKeys.all, offset, limit],
    queryFn: async (): Promise<AdminAccountListResult> => {
      const data: any = await accountListDirectory(
        ADMIN_ACCOUNT_ATTRS,
        'accounts',
        '',
        ADMIN_ACCOUNT_SEARCH_QUERY,
        offset,
        limit,
      );
      const accounts: Array<Record<string, any>> = (data?.account || []).map(flattenAttrs);
      return { accounts, total: data?.searchTotal || 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
