/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

export const createGalSyncAccount = async (
	name: string,
	domainName: string | undefined,
	server: string,
	account: Array<any>,
	type: string,
	a?: { n: string; _content: string }[],
	folder?: string
): Promise<any> => {
	const request: any = {
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
	return soapFetch(`CreateGalSyncAccount`, {
		...request
	});
};
