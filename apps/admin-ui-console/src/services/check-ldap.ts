/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSoapFetchRequest } from '@zextras/admin-ui-bootstrapper';

export const checkLdap = async (): Promise<any> =>
	getSoapFetchRequest(`/service/extension/zextras_admin/backup/checkLDAPDump`);
