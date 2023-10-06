/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getMailQueue = async (serverName: string, queueName?: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		server: {
			name: serverName,
			queue: {
				name: queueName || 'active',
				query: {
					offset: 0,
					limit: 12
				}
			}
		}
	};

	return soapFetch(`GetMailQueue`, {
		...request
	});
};
