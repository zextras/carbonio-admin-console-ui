/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const renameCos = async (body: JSON): Promise<any> =>
	fetch(`/service/admin/soap/RanemCosRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				RenameCosRequest: body
			}
		})
	});
