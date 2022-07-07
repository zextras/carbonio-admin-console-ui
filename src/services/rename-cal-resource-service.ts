/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const renameCalendarResource = async (
	resourceId: string,
	newName?: string
): Promise<any> => {
	const request: any = {
		RenameCalendarResourceRequest: {
			_jsns: 'urn:zimbraAdmin',
			id: resourceId,
			newName
		}
	};

	return fetch(`/service/admin/soap/RenameCalendarResourceRequest`, {
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
