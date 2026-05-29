/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { CreateGalSyncAccountRequest, CreateGalSyncAccountResponse, SoapAttribute, SoapEntitySelector } from '../../types';

export const createGalSyncAccount = async (
	name: string,
	domainName: string | undefined,
	server: string,
	account: Array<SoapEntitySelector>,
	type: string,
	a?: Array<SoapAttribute>,
	folder?: string
): Promise<CreateGalSyncAccountResponse> => {
	const request: CreateGalSyncAccountRequest = {
		_jsns: 'urn:zimbraAdmin',
		name,
		domain: domainName,
		server,
		type,
		account
	};
	if (folder) {
		request.folder = folder;
	}
	if (a) {
		request.a = a;
	}
	return soapFetch<CreateGalSyncAccountRequest, CreateGalSyncAccountResponse>(`CreateGalSyncAccount`, {
		...request
	});
};
