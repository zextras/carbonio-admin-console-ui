/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	fetchExternalSoap
} from '@zextras/carbonio-shell-ui';

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
