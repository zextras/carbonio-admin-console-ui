/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest
} from '@zextras/carbonio-shell-ui';

export const checkLdap = async (): Promise<any> =>
	getSoapFetchRequest(`/service/extension/zextras_admin/backup/checkLDAPDump`);
