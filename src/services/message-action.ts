/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest
} from '@zextras/carbonio-shell-ui';

export const msgActionRequest = async (id: string, op: string): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap/MsgActionRequest`,
		{
			_jsns: 'urn:zimbraMail',
			action: {
				id,
				op
			}
		},
		'MsgActionRequest'
	);
