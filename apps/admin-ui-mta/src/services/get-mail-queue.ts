/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { MtaMailQueue } from '../../types';

type GetMailQueueRequest = {
	_jsns: string;
	server: {
		name: string;
		queue: { name: string; scan: number; query: { offset: number; limit: number } };
	};
};

type GetMailQueueResponse = { server: Array<{ queue: Array<MtaMailQueue> }> };

export const getMailQueue = async (
	serverName: string,
	queueName?: string,
	offset?: number,
	limit?: number,
): Promise<GetMailQueueResponse> => {
	const request: GetMailQueueRequest = {
		_jsns: 'urn:zimbraAdmin',
		server: {
			name: serverName,
			queue: {
				name: queueName || 'active',
				scan: 1,
				query: {
					offset: offset || 0,
					limit: limit || 25,
				},
			},
		},
	};

	return soapFetch(`GetMailQueue`, { ...request });
};
