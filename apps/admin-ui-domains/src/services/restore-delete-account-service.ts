/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import type { RestoreDeleteAccountRequest, RestoreDeleteAccountResponse } from '../../types';

export const doRestoreDeleteAccount = async (
	dataItem: unknown,
	targetServers: string
): Promise<RestoreDeleteAccountResponse> => {
	const data = dataItem as RestoreDeleteAccountRequest;
	return fetchExternalSoap(
		`/service/extension/zextras_admin/backup/doRestoreOnNewAccount?targetServers=${encodeURIComponent(targetServers)}`,
		{
			...data
		}
	);
};
