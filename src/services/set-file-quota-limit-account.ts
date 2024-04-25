/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	fetchExternalSoap
} from '@zextras/carbonio-shell-ui';

export const setFileQuotaLimitByAccount = async (accId: string, limit: string): Promise<any> => {
	fetchExternalSoap(
		`/services/storages/admin/quota/config/accounts/${accId}`,
		{
			limit
		},
		'',
		'PUT'
	);
};
