/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';

export const getMailQueue = async (
	serverName: string,
	queueName?: string,
	offset?: number,
	limit?: number
): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		server: {
			name: serverName,
			queue: {
				name: queueName || 'active',
				scan: 1,
				query: {
					offset: offset || 0,
					limit: limit || 25
				}
			}
		}
	};

	return soapFetch(`GetMailQueue`, {
		...request
	});
};
