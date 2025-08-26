/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

export const getMailqueueInformation = async (serverName: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		server: {
			name: serverName
		}
	};

	return soapFetch(`GetMailQueueInfo`, {
		...request
	});
};
