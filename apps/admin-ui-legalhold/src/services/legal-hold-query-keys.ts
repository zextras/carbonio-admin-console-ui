/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const legalHoldQueryKeys = {
  all: ['legal-hold'] as const,
  backupAccounts: (
    domain: string,
    filter: string,
    legalHold: boolean,
    page: number,
    pageSize: number,
  ) => [...legalHoldQueryKeys.all, 'backup-accounts', domain, filter, legalHold, page, pageSize] as const,
  domains: (searchKeyword: string) => [...legalHoldQueryKeys.all, 'domains', searchKeyword] as const,
  accountDirectory: (searchStr: string, excludeAccountId: string) =>
    [...legalHoldQueryKeys.all, 'account-directory', searchStr, excludeAccountId] as const,
  account: (accountName: string) => [...legalHoldQueryKeys.all, 'account', accountName] as const,
};
