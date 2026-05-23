/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { CoreAttributeRequest } from './get-core-attributes';

export const cosQueryKeys = {
  all: ['cos'] as const,
  detail: (cosId: string) => [...cosQueryKeys.all, 'detail', cosId] as const,
  totalAccounts: (cosId: string) => [...cosQueryKeys.all, 'total-accounts', cosId] as const,
  totalDomains: (cosId: string) => [...cosQueryKeys.all, 'total-domains', cosId] as const,
  coreAttributes: (body: Array<CoreAttributeRequest>) =>
    [...cosQueryKeys.all, 'core-attributes', body] as const,
  fileQuota: (cosId: string) => [...cosQueryKeys.all, 'file-quota', cosId] as const,
  cosQuota: (cosId: string) => [...cosQueryKeys.all, 'cos-quota', cosId] as const,
};
