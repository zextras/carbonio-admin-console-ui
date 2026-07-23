/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const domainQueryKeys = {
  all: ['domain'] as const,
  list: () => [...domainQueryKeys.all, 'list'] as const,
  quota: (domainId: string) => [...domainQueryKeys.all, 'quota', domainId] as const,
} as const;
