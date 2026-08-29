/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

export type RestoreAccountRequestParams = {
	id: string;
	createDate: string;
	copyAccount: string;
	dateTime: string | null;
	hsmApply: boolean;
	notificationReceiver: string;
	isEmailNotificationEnable: boolean;
	copyDomain: string;
	serverName: string;
};

export type RestoreDeletedAccountBody = {
	srcAccountName: string;
	obeyHSM: boolean;
	notificationMails?: Array<string>;
	dstAccountName?: string;
	date?: number | string;
};

export type RestoreDeletedAccountResponse = {
	operationId?: string;
	status?: number;
	error?: { message?: string; details?: { cause?: string } };
};

export function buildRestoreDeletedAccountBody(
	params: RestoreAccountRequestParams
): RestoreDeletedAccountBody {
	const body: RestoreDeletedAccountBody = {
		srcAccountName: params.id,
		obeyHSM: params.hsmApply
	};
	if (params.notificationReceiver !== '' && params.isEmailNotificationEnable) {
		body.notificationMails = [params.notificationReceiver];
	}
	if (params.copyAccount !== '') {
		body.dstAccountName = `${params.copyAccount.split('@')[0]}@${params.copyDomain}`;
	}
	if (params.dateTime) {
		body.date = new Date(params.dateTime).getTime();
		if (body.date < Number(params.createDate)) {
			body.date = params.createDate;
		}
	}
	return body;
}

export const doRestoreDeleteAccount = async (
	body: RestoreDeletedAccountBody,
	targetServers: string
): Promise<RestoreDeletedAccountResponse> =>
	fetchExternalSoap<RestoreDeletedAccountBody, RestoreDeletedAccountResponse>(
		`/service/extension/zextras_admin/backup/doRestoreOnNewAccount?targetServers=${targetServers}`,
		{
			...body
		}
	);
