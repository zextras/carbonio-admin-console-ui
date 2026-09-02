/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export const getGrant = async (body: Record<string, unknown>): Promise<any> =>
	soapFetch(`GetGrants`, {
		_jsns: 'urn:zimbraAdmin',
		...body
	});
