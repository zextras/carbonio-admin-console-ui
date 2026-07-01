/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { EndSessionRequest, SoapEmptyResponse } from '../../types';

export const endSession = async (
	sessionId: string,
	accountName: string,
	token: string
): Promise<SoapEmptyResponse> =>
	soapFetch<EndSessionRequest, SoapEmptyResponse>(
		`EndSession`,
		{
			_jsns: 'urn:zimbraAccount',
			sessionId,
			logoff: 1,
			all: 0,
			excludeCurrent: 0
		},
		{
			otherAccount: accountName,
			authToken: token,
			noSession: true
		}
	);
