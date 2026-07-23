/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDomainSearch as useDomainSearchQuery } from '@zextras/ui-shared';

import { getDomainListNew } from './search-domain-service';

type UseDomainSearchOptions = {
  searchQuery: string;
  limit: number;
  offset: number;
  enabled?: boolean;
};

export const useDomainSearch = ({
  searchQuery,
  limit,
  offset,
  enabled = true,
}: UseDomainSearchOptions) =>
  useDomainSearchQuery({
    searchQuery,
    limit,
    offset,
    enabled,
    queryFn: () => getDomainListNew(searchQuery || undefined, offset, limit),
  });
