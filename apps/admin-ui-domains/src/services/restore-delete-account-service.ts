/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	doRestoreOnNewAccount,
	type RestoreAccountBody,
	type RestoreAccountRawResponse,
} from '@zextras/ui-shared';

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

export type RestoreDeletedAccountBody = RestoreAccountBody;

export type RestoreDeletedAccountResponse = RestoreAccountRawResponse;

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
): Promise<RestoreDeletedAccountResponse> => doRestoreOnNewAccount(body, targetServers);
