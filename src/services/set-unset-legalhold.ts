/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	fetchExternalSoap
} from '@zextras/carbonio-shell-ui';

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
