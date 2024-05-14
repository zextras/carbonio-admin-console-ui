/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest
} from '@zextras/carbonio-shell-ui';

type RestoreResponse = {
	operationId: string;
};

export const doRestoreOnNewLegalHoldAccount = async (
	srcAccountName: string,
	dstAccountName: string,
	date: number
): Promise<RestoreResponse> =>
	postSoapFetchRequest(
		`/service/admin/soap/zextras`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxBackup',
			action: 'doRestoreOnNewAccount',
			command: 'doRestoreOnNewAccount',
			srcAccountName,
			dstAccountName,
			date,
			undelete: true,
			undeleteStartDate: date,
			restoreChatBuddies: false,
			obeyHSM: false,
			restoreDatasource: false
		},
		'zextras'
	).then((data: any) => {
		if (data?.Body?.response?.content) {
			const parseData = JSON.parse(data.Body.response.content);
			const operationId = parseData?.response?.operationId;
			if (operationId) {
				return { operationId };
			}
		}
		return Promise.reject(new Error('Something went wrong. Please try again.'));
	});
