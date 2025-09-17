/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/admin-ui-bootstrapper';

export const doRestoreDeleteAccount = async (
	dataItem: unknown,
	targetServers: string
): Promise<any> => {
	const data: any = dataItem;
	return fetchExternalSoap(
		`/service/extension/zextras_admin/backup/doRestoreOnNewAccount?targetServers=${targetServers}`,
		{
			...data
		}
	);
};
