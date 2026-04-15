/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { MailQueueInfo } from '../../types';

type GetMailQueueInfoRequest = { _jsns: string; server: { name: string } };

type GetMailQueueInfoResponse = { server: Array<{ queue: Array<MailQueueInfo> }> };

export const getMailqueueInformation = async (
	serverName: string,
): Promise<GetMailQueueInfoResponse> => {
	const request: GetMailQueueInfoRequest = {
		_jsns: 'urn:zimbraAdmin',
		server: { name: serverName },
	};

	return soapFetch(`GetMailQueueInfo`, { ...request });
};
