/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getCalenderResource = async (resourceId: string): Promise<any> =>
	fetch(`/service/admin/soap/GetCalendarResourceRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				GetCalendarResourceRequest: {
					_jsns: 'urn:zimbraAdmin',
					calresource: {
						by: 'id',
						_content: resourceId
					},
					applyCos: '0'
				}
			},
			Header: {
				context: {
					_jsns: 'urn:zimbra',
					session: {}
				}
			}
		})
	});
