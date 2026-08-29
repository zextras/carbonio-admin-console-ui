/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { CoreAttributeRequest } from '@zextras/ui-shared';
import { cosQuotaQueryKey } from '@zextras/ui-shared';

export const cosQueryKeys = {
  all: ['cos'] as const,
  detail: (cosId: string) => [...cosQueryKeys.all, 'detail', cosId] as const,
  totalAccounts: (cosId: string) => [...cosQueryKeys.all, 'total-accounts', cosId] as const,
  totalDomains: (cosId: string) => [...cosQueryKeys.all, 'total-domains', cosId] as const,
  coreAttributes: (body: Array<CoreAttributeRequest>) =>
    [...cosQueryKeys.all, 'core-attributes', body] as const,
  cosQuota: (cosId: string) => cosQuotaQueryKey(cosId),
  list: (searchQuery: string, limit: number, offset: number) =>
    [...cosQueryKeys.all, 'list', searchQuery, limit, offset] as const,
  accounts: (cosId: string, searchStr: string, offset: number, limit: number) =>
    [...cosQueryKeys.all, 'accounts', cosId, searchStr, offset, limit] as const,
  domains: (cosId: string, searchStr: string, offset: number, limit: number) =>
    [...cosQueryKeys.all, 'domains', cosId, searchStr, offset, limit] as const,
};
