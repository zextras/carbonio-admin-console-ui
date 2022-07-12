/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const createSignature = async (
	id: string,
	signatureName: string,
	signatureContent: string
): Promise<any> =>
	fetch(`/service/admin/soap/CreateSignatureRequest`, {
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
				CreateSignatureRequest: {
					_jsns: 'urn:zimbraAccount',
					signature: {
						name: signatureName,
						content: {
							type: 'text/plain',
							_content: signatureContent
						}
					}
				}
			}
		})
	});
