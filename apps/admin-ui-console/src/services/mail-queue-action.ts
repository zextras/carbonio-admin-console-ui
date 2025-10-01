/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';

export const mailQueueAction = async (
	serverName: string,
	queueName: string,
	operation: string,
	queueId: string
): Promise<any> =>
	soapFetch(`MailQueueAction`, {
		_jsns: 'urn:zimbraAdmin',
		server: {
			name: serverName,
			queue: {
				name: queueName,
				action: {
					op: operation,
					by: 'id',
					_content: queueId
				}
			}
		}
	});
