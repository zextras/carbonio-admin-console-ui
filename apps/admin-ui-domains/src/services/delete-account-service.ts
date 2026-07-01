/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { DeleteAccountRequest, SoapEmptyResponse } from '../../types';

export const deleteAccount = async (accountId: string): Promise<SoapEmptyResponse> =>
	soapFetch<DeleteAccountRequest, SoapEmptyResponse>(`DeleteAccount`, {
		_jsns: 'urn:zimbraAdmin',
		id: accountId
	});
