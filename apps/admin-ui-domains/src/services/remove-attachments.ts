/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

export const removeAttachmentsRequest = async (id: string, part: string): Promise<unknown> =>
	postSoapFetchRequest(
		`/service/admin/soap/RemoveAttachmentsRequest`,
		{
			_jsns: 'urn:zimbraMail',
			m: {
				id,
				part
			}
		},
		'RemoveAttachmentsRequest'
	);
