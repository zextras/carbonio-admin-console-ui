/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const getInitializedDomains = async (body: { [key: string]: any }): Promise<unknown> =>
	fetch(`/service/extension/zextras_admin/admin/getInitializedDomains`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	}).then((r) => r.json());
