/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '../network/fetch';

const ACCOUNTS = 'accounts';
const COS = 'cos';

export const resetFileQuotaLimitById = async (accId: string, type?: string): Promise<void> => {
	const fetchType = type === COS ? COS : ACCOUNTS;
	return fetchExternalSoap(
		`/services/storages/admin/quota/config/${fetchType}/${accId}`,
		{},
		'',
		'DELETE',
	);
};
