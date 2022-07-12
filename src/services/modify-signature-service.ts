/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const modifySignature = async (
	id: string,
	signatureId: string,
	signaturName: string,
	content: string
): Promise<any> =>
	fetch(`/service/admin/soap/ModifySignatureRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Header: {
				context: {
					_jsns: 'urn:zimbra',
					account: {
						by: 'id',
						_content: id
					}
				}
			},
			Body: {
				ModifySignatureRequest: {
					_jsns: 'urn:zimbraAccount',
					signature: {
						name: signaturName,
						id: signatureId,
						content: {
							type: 'text/plain',
							_content: content
						}
					}
				}
			}
		})
	});
