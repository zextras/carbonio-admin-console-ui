/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { SearchDomainDirectories } from '@zextras/ui-shared';

export type DirectoryAccountOption = {
  id: string;
  name: string;
};

export function parseDirectoryAccounts(data: SearchDomainDirectories): Array<DirectoryAccountOption> {
  const accounts = data.account ?? [];
  return accounts
    .filter((item) => item.id !== '' && item.name !== '')
    .map((item) => ({ id: item.id, name: item.name }));
}

export function errorMessage(err: Error, fallback: string): string {
  return err.message === '' ? fallback : err.message;
}
