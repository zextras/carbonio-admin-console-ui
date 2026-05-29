/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import { ACCOUNTS, COS } from '../constants';

export const resetFileQuotaLimitById = async (accId: string, type?: string): Promise<void> => {
	const fetchType = type === COS ? COS : ACCOUNTS;
	fetchExternalSoap(
		`/services/storages/admin/quota/config/${fetchType}/${accId}`,
		{},
		'',
		'DELETE'
	);
};
