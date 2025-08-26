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

export const deleteSignature = async (id: string, signatureId: string): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap/DeleteSignatureRequest`,
		{
			_jsns: 'urn:zimbraAccount',
			signature: {
				id: signatureId
			}
		},
		'DeleteSignatureRequest',
		id
	);
