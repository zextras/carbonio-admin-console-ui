/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { GetAccountRequest, GetAccountResponse } from '../../types';

export const getAccount = async (accountId: string): Promise<GetAccountResponse> =>
	soapFetch<GetAccountRequest, GetAccountResponse>(`GetAccount`, {
		_jsns: 'urn:zimbraAdmin',
		account: {
			by: 'id',
			_content: accountId
		}
	});
