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
