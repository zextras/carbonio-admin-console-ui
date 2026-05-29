/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { CountAccountRequest, CountAccountResponse } from '../../types';

export const countAccount = async (domainName: string): Promise<CountAccountResponse> =>
	soapFetch<CountAccountRequest, CountAccountResponse>(`CountAccount`, {
		_jsns: 'urn:zimbraAdmin',
		domain: {
			_content: domainName,
			by: 'name'
		}
	});