/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSoapFetchRequest } from '@zextras/ui-shared';

import type { CheckLdapResponse } from '../../types';

export const checkLdap = async (): Promise<CheckLdapResponse> =>
	getSoapFetchRequest<CheckLdapResponse>(`/service/extension/zextras_admin/backup/checkLDAPDump`);
