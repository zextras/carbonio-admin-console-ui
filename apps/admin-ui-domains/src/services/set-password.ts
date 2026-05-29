/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { SetPasswordRequest, SoapEmptyResponse } from '../../types';

export const setPasswordRequest = async (id: string, newPassword: string): Promise<SoapEmptyResponse> => {
	const request: SetPasswordRequest = {
		_jsns: 'urn:zimbraAdmin',
		id,
		newPassword
	};

	return soapFetch<SetPasswordRequest, SoapEmptyResponse>(`SetPassword`, {
		...request
	});
};
