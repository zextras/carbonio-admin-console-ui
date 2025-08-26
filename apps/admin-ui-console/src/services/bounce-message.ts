/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrapper';

export const bounceMsgRequest = async (message: any): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap/BounceMsgRequest`,
		{
			_jsns: 'urn:zimbraMail',
			m: {
				id: message.id,
				e: [
					{
						t: 't',
						a: message.envelopeTo
					},
					{
						t: 'f',
						a: message.envelopeFrom
					}
				]
			}
		},
		'BounceMsgRequest'
	);
