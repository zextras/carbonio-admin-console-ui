/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const deleteSignature = async (id: string, signatureId: string): Promise<any> =>
	fetch(`/service/admin/soap/DeleteSignatureRequest`, {
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
				DeleteSignatureRequest: {
					_jsns: 'urn:zimbraAccount',
					signature: {
						id: signatureId
					}
				}
			}
		})
	});
