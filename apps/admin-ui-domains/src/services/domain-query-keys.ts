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
  addressBookList: (domainName: string) =>
    [...domainQueryKeys.all, 'address-book-list', domainName] as const,
  mailboxContactFolders: (account: string) =>
    [...domainQueryKeys.all, 'mailbox-contact-folders', account] as const,
  exposedAddressBookFolders: (domain: string, account: string) =>
    [...domainQueryKeys.all, 'exposed-address-book-folders', domain, account] as const,
  unexposedAddressBookFolders: (domain: string, account: string) =>
    [...domainQueryKeys.all, 'unexposed-address-book-folders', domain, account] as const,
  addressBookAccountSearch: (domainName: string, keyword: string) =>
    [...domainQueryKeys.all, 'address-book-account-search', domainName, keyword] as const,
  antiDosConfig: () => [...domainQueryKeys.all, 'anti-dos-config'] as const,
  samlConfig: (domain: string) => [...domainQueryKeys.all, 'saml-config', domain] as const,
  gal: () => [...domainQueryKeys.all, 'gal'] as const,
  galAccount: (accountId: string) => [...domainQueryKeys.gal(), 'account', accountId] as const,
  galDataSources: (accountId: string) =>
    [...domainQueryKeys.gal(), 'dataSources', accountId] as const,
  domainCert: (domainId: string) => [...domainQueryKeys.all, 'cert', domainId] as const,
  domainSslMaterial: (domainName: string) =>
    [...domainQueryKeys.all, 'ssl-material', domainName] as const,
  calResource: (resourceId: string) => [...domainQueryKeys.all, 'cal-resource', resourceId] as const,
  calResourceList: (
    domain: string,
    query: string,
    sortBy: string,
    sortOrder: string,
    offset: number,
    limit: number,
  ) => [...domainQueryKeys.all, 'cal-resource-list', domain, query, sortBy, sortOrder, offset, limit] as const,
  accountDetail: (accountId: string) =>
    [...domainQueryKeys.all, 'account-detail', accountId] as const,
  accountCoreAttributes: (accountId: string) =>
    [...domainQueryKeys.all, 'account-core-attributes', accountId] as const,
  accountSpecificDetail: (accountId: string) =>
    [...domainQueryKeys.all, 'account-specific-detail', accountId] as const,
  cosDetail: (cosId: string) => [...domainQueryKeys.all, 'cos-detail', cosId] as const,
  otpList: (accountName: string) => [...domainQueryKeys.all, 'otp-list', accountName] as const,
  credentialList: (accountName: string) =>
    [...domainQueryKeys.all, 'credential-list', accountName] as const,
  accountGrants: (accountId: string) =>
    [...domainQueryKeys.all, 'account-grants', accountId] as const,
  initializedDomains: (search: string) =>
    [...domainQueryKeys.all, 'initialized-domains', search] as const,
  activeSyncDevices: (domainName: string) =>
    [...domainQueryKeys.all, 'active-sync-devices', domainName] as const,
  activeSyncDeviceStats: (accountEmail: string, deviceId: string) =>
    [...domainQueryKeys.all, 'active-sync-device-stats', accountEmail, deviceId] as const,
  accountListDirectory: {
    base: () => [...domainQueryKeys.all, 'account-list-directory'] as const,
    search: (params: {
      attr: string;
      type: string;
      domainName?: string;
      query: string;
      offset: number;
      limit: number;
      sortBy?: string;
      sortAscending?: string;
    }) =>
      [
        ...domainQueryKeys.accountListDirectory.base(),
        params.attr,
        params.type,
        params.domainName ?? '',
        params.query,
        params.offset,
        params.limit,
        params.sortBy ?? '',
        params.sortAscending ?? '',
      ] as const,
  },
  accountCount: {
    base: () => [...domainQueryKeys.all, 'account-count'] as const,
    detail: (domainName: string) =>
      [...domainQueryKeys.accountCount.base(), domainName] as const,
  },
  quarantineAccount: () => [...domainQueryKeys.all, 'quarantine-account'] as const,
  quarantineMessages: () => [...domainQueryKeys.all, 'quarantine-messages'] as const,
} as const;
