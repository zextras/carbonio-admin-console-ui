/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { DelegateAuthRequest, DelegateAuthResponse } from '../../types';

export const getDelegateAuthRequest = async (id: string, name?: string): Promise<DelegateAuthResponse> => {
	const request: DelegateAuthRequest = {
		_jsns: 'urn:zimbraAdmin',
		account: [
			{
				_content: id || name || '',
				by: id ? 'id' : 'name'
			}
		]
	};

	return soapFetch<DelegateAuthRequest, DelegateAuthResponse>(`DelegateAuth`, {
		...request
	});
};
