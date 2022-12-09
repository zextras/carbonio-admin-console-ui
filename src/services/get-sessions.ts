/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getSessions = async (
	type: string,
	accountName: string,
	offset?: number,
	limit?: number
): Promise<any> =>
	soapFetch(
		`GetSessions`,
		{
			_jsns: 'urn:zimbraAdmin',
			type,
			offset: offset || 0,
			sortBy: 'nameAsc',
			refresh: 1
		},
		accountName
	);
