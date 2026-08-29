/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchAccount } from '@zextras/ui-shared';

import type { DirectoryAccount, ServiceResult } from '../../types';

export type GetAccountResult = ServiceResult<{ account: DirectoryAccount | null }>;

export async function getAccount(accountName: string): Promise<GetAccountResult> {
	try {
		const data = await fetchAccount('name', accountName);
		return { type: 'success', account: (data.account?.[0] ?? null) as DirectoryAccount | null };
	} catch (error) {
		return {
			type: 'error',
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
