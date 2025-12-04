/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/admin-ui-bootstrap';

export const setUnsetLegalHold = async (
	status: string,
	id: string,
	servers: string
): Promise<any> =>
	fetchExternalSoap(`/service/extension/zextras_admin/backup/legalHold?targetServers=${servers}`, {
		ui: true,
		command: status,
		accounts: id
	});
