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

export const createSignature = async (
	id: string,
	signatureName: string,
	signatureContent: string
): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap/CreateSignatureRequest`,
		{
			_jsns: 'urn:zimbraAccount',
			signature: {
				name: signatureName,
				content: {
					type: 'text/plain',
					_content: signatureContent
				}
			}
		},
		'CreateSignatureRequest',
		id
	);
