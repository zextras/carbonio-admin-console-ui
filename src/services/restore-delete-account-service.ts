/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const doRestoreDeleteAccount = async (dataItem: unknown): Promise<any> => {
	const data = JSON.stringify(dataItem);
	return fetch(`/service/extension/zextras_admin/backup/doRestoreOnNewAccount`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: data
	});
};
