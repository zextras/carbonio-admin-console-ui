/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { DeleteGalSyncAccountRequest, SoapEmptyResponse } from '../../types';

export const destroyAccount = async (accountId: string): Promise<SoapEmptyResponse> =>
	soapFetch<DeleteGalSyncAccountRequest, SoapEmptyResponse>(`DeleteGalSyncAccount`, {
		_jsns: 'urn:zimbraAdmin',
		account: {
			by: 'id',
			_content: accountId
		}
	});
