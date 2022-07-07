/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const setPasswordRequest = async (
	resourceId: string,
	newPassword?: string
): Promise<any> => {
	const request: any = {
		SetPasswordRequest: {
			_jsns: 'urn:zimbraAdmin',
			id: resourceId,
			newPassword
		}
	};

	return fetch(`/service/admin/soap/SetPasswordRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: request
		})
	});
};
