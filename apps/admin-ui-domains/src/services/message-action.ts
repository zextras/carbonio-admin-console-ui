/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { MessageActionRequest, MessageActionResponse } from '../../types';

export const msgActionRequest = async (
	id: string,
	op: MessageActionRequest['action']['op']
): Promise<MessageActionResponse> =>
	postSoapFetchRequest(
		`/service/admin/soap/MsgActionRequest`,
		{
			_jsns: 'urn:zimbraMail',
			action: {
				id,
				op
			}
		} as MessageActionRequest,
		'MsgActionRequest'
	);
