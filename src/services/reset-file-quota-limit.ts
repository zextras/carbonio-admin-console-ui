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

import { ACCOUNTS, COS } from '../constants';

export const resetFileQuotaLimitById = async (accId: string, type?: string): Promise<any> => {
	const fetchType = type === COS ? COS : ACCOUNTS;
	fetchExternalSoap(
		`/services/storages/admin/quota/config/${fetchType}/${accId}`,
		{},
		'',
		'DELETE'
	);
};
