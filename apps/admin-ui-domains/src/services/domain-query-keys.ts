/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const domainQueryKeys = {
  all: ['domain'] as const,
  list: () => [...domainQueryKeys.all, 'list'] as const,
  quota: (domainId: string) => [...domainQueryKeys.all, 'quota', domainId] as const,
  accountQuota: (accountId: string) =>
    [...domainQueryKeys.all, 'account-quota', accountId] as const,
  cosQuota: (cosId: string) => [...domainQueryKeys.all, 'cos-quota', cosId] as const,
  accountSignatures: (accountId: string) =>
    [...domainQueryKeys.all, 'account-signatures', accountId] as const,
  accountMembership: (accountId: string) =>
    [...domainQueryKeys.all, 'account-membership', accountId] as const,
  userSessions: (accountName: string) =>
    [...domainQueryKeys.all, 'user-sessions', accountName] as const,
  twoFactorPolicies: (domain: string) =>
    [...domainQueryKeys.all, 'two-factor-policies', domain] as const,
  addressBookService: () => [...domainQueryKeys.all, 'address-book-service'] as const,
  antiDosConfig: () => [...domainQueryKeys.all, 'anti-dos-config'] as const,
  samlConfig: (domain: string) => [...domainQueryKeys.all, 'saml-config', domain] as const,
  calResource: (resourceId: string) => [...domainQueryKeys.all, 'cal-resource', resourceId] as const,
  calResourceList: (
    domain: string,
    query: string,
    sortBy: string,
    sortOrder: string,
    offset: number,
    limit: number,
  ) => [...domainQueryKeys.all, 'cal-resource-list', domain, query, sortBy, sortOrder, offset, limit] as const,
} as const;
