/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const endSession = async (
	sessionId: string,
	accountName: string,
	token: string
): Promise<any> =>
	soapFetch(
		`EndSession`,
		{
			_jsns: 'urn:zimbraAccount',
			sessionId,
			logoff: 1,
			all: 0,
			excludeCurrent: 0
		},
		accountName,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		undefined,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		token,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		true
	);
