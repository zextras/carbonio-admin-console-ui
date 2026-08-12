/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type {
  AccountListDirectoryResponse,
  DirectoryAccount,
  SearchDirectoryRequest,
  ServiceResult,
} from '../../types';
import { ASC } from '../constants';

export type AccountListDirectoryParams = {
  attr: string;
  type: string;
  domainName: string;
  query: string;
  offset: number;
  limit: number;
  sortBy?: string;
  sortAscending?: string;
  excludeAccountId?: string;
};

export type AccountListDirectoryResult = ServiceResult<{
  accounts: Array<DirectoryAccount>;
}>;

export function mergeDirectorySearchResults(
  data: AccountListDirectoryResponse,
  excludeAccountId?: string,
): Array<DirectoryAccount> {
  const accounts =
    data.account
      ?.filter((item) => item.id !== excludeAccountId)
      .map((item) => ({ ...item, type: 'usr' })) ?? [];
  const distributionLists = data.dl?.map((item) => ({ ...item, type: 'grp' })) ?? [];
  return [...accounts, ...distributionLists];
}

export async function accountListDirectory({
  attr,
  type,
  domainName,
  query,
  offset,
  limit,
  sortBy,
  sortAscending,
  excludeAccountId,
}: AccountListDirectoryParams): Promise<AccountListDirectoryResult> {
  const request: SearchDirectoryRequest = {
    _jsns: 'urn:zimbraAdmin',
    offset,
    limit,
    applyCos: 'false',
    applyConfig: 'false',
    attrs: attr,
    types: type,
  };
  if (domainName !== '') {
    request.domain = domainName;
  }
  if (query !== '') {
    request.query = query;
  }
  if (sortBy) {
    request.sortBy = sortBy;
  }
  if (sortAscending) {
    request.sortAscending = sortAscending === ASC ? 1 : 0;
  }

  try {
    const data = await soapFetch<SearchDirectoryRequest, AccountListDirectoryResponse>(
      `SearchDirectory`,
      request,
    );
    return { type: 'success', accounts: mergeDirectorySearchResults(data, excludeAccountId) };
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
