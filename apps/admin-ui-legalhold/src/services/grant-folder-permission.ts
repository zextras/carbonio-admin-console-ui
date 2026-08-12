/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { DirectoryAccount } from '../../types';

type FolderActionRequest = {
  _jsns: string;
  action: {
    op: string;
    id: string;
    grant: {
      perm: string;
      gt: string;
      d: string;
      pw: string;
    };
  };
};

export type GrantFolderPermissionResult = { type: 'success' } | { type: 'error'; error: string };

export async function grantFolderPermission(
  account: DirectoryAccount,
  targetAccountId: string,
): Promise<GrantFolderPermissionResult> {
  try {
    await postSoapFetchRequest<FolderActionRequest, unknown>(
      `/service/admin/soap/FolderActionRequest`,
      {
        _jsns: 'urn:zimbraMail',
        action: {
          op: 'grant',
          id: '1',
          grant: {
            perm: 'r',
            gt: account.type ?? 'usr',
            d: account.name,
            pw: '',
          },
        },
      },
      'FolderActionRequest',
      targetAccountId,
    );
    return { type: 'success' };
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function grantFolderPermissions(
  accounts: Array<DirectoryAccount>,
  targetAccountId: string,
): Promise<GrantFolderPermissionResult> {
  const results = await Promise.all(
    accounts.map((account) => grantFolderPermission(account, targetAccountId)),
  );
  const firstError = results.find((result) => result.type === 'error');
  if (firstError) {
    return firstError;
  }
  return { type: 'success' };
}
