/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fetchExternalSoap } from '@zextras/admin-ui-bootstrapper';

type RestoreResponse = {
	operationId: string;
};

export const doRestoreOnNewLegalHoldAccount = async (
	srcAccountName: string,
	dstAccountName: string,
	date: number,
	undeleteDate: number | undefined,
	unDelete: boolean,
	targetServers: string
): Promise<RestoreResponse> =>
	fetchExternalSoap(
		`/service/extension/zextras_admin/backup/doRestoreOnNewAccount?targetServers=${targetServers}`,
		{
			srcAccountName,
			dstAccountName,
			date,
			undelete: unDelete,
			undeleteStartDate: undeleteDate
		}
	)
		.then((data: any) => {
			if (data?.error) {
				return Promise.reject(data.error);
			}
			const parseData = data?.operationId
				? data
				: JSON.parse(data?.Body?.response?.content || '{}');
			const message: string = parseData?.error?.message || parseData?.message;
			if (message) {
				return Promise.reject(message);
			}
			const operationId = data?.operationId ?? parseData?.response?.operationId;
			if (!operationId) {
				const msg = undefined;
				return Promise.reject(msg);
			}
			return { operationId };
		})
		.catch((err: any) => Promise.reject(err));
