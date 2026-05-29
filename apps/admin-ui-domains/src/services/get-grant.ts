/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { GetGrantsResponse } from '../../types';

export const getGrant = async (body: Record<string, unknown>): Promise<GetGrantsResponse> =>
	soapFetch<Record<string, unknown>, GetGrantsResponse>(`GetGrants`, {
		_jsns: 'urn:zimbraAdmin',
		...body
	});
