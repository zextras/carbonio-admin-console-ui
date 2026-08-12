/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { DomainItem, DomainResponse, ServiceResult } from '../../types';

export type GetDomainListResult = ServiceResult<{
  domain: Array<DomainItem>;
  searchTotal: number;
  more: boolean;
}>;

export async function getDomainList(
  searchKeyWord: string,
  offset: number,
  limit?: number,
): Promise<GetDomainListResult> {
  try {
    const data = await soapFetch<Record<string, unknown>, DomainResponse>(`SearchDirectory`, {
      _jsns: 'urn:zimbraAdmin',
      limit: limit ?? 50,
      offset: offset || 0,
      sortBy: 'zimbraDomainName',
      sortAscending: '1',
      applyCos: 'false',
      applyConfig: 'false',
      attrs: 'description,zimbraDomainName,zimbraDomainStatus,zimbraId,zimbraDomainType',
      types: 'domains',
      query: {
        _content:
          searchKeyWord && searchKeyWord !== '' ? `(|(zimbraDomainName=*${searchKeyWord}*))` : '',
      },
    });
    return {
      type: 'success',
      domain: data.domain ?? [],
      searchTotal: data.searchTotal ?? 0,
      more: data.more ?? false,
    };
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
