/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { DirectoryAccount, GetAccountResponse, ServiceResult } from '../../types';
import { ZIMBRA_ADMIN_URN } from '../constants';

type GetAccountRequest = {
  _jsns: string;
  account: {
    by: string;
    _content: string;
  };
};

export type GetAccountResult = ServiceResult<{ account: DirectoryAccount | null }>;

export async function getAccount(accountName: string): Promise<GetAccountResult> {
  try {
    const data = await soapFetch<GetAccountRequest, GetAccountResponse>(`GetAccount`, {
      _jsns: ZIMBRA_ADMIN_URN,
      account: {
        by: 'name',
        _content: accountName,
      },
    });
    return { type: 'success', account: data.account?.[0] ?? null };
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
