/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getDomainList, useDomainSearch as useDomainSearchQuery } from '@zextras/ui-shared';

type UseDomainSearchOptions = {
  searchQuery: string;
  limit: number;
  offset: number;
  sortAscending?: string;
  statusFilters?: Array<string>;
  enabled?: boolean;
};

export const useDomainSearch = ({
  searchQuery,
  limit,
  offset,
  sortAscending = '1',
  statusFilters = [],
  enabled = true,
}: UseDomainSearchOptions) =>
  useDomainSearchQuery({
    searchQuery,
    limit,
    offset,
    sortAscending,
    statusFilters,
    enabled,
    queryFn: () =>
      getDomainList(searchQuery || undefined, offset, limit, sortAscending, statusFilters),
  });
