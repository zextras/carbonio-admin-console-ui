/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { SoapEmptyResponse, SyncGalAccountRequest } from '../../types';

export const reSyncGalAccount = async (accountId?: string): Promise<SoapEmptyResponse> =>
	soapFetch<SyncGalAccountRequest, SoapEmptyResponse>(`SyncGalAccount`, {
		_jsns: 'urn:zimbraAdmin',
		account: {
			id: accountId
		}
	});
