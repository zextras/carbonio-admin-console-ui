/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrap';

export const modifySignature = async (
	id: string,
	signatureId: string,
	signaturName: string,
	content: string
): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap/ModifySignatureRequest`,
		{
			_jsns: 'urn:zimbraAccount',
			signature: {
				name: signaturName,
				id: signatureId,
				content: {
					type: 'text/plain',
					_content: content
				}
			}
		},
		'ModifySignatureRequest',
		id
	);
