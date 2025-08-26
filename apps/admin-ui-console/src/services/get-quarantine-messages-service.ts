/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrapper';

export const getQuarantineMessages = async (id: string): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap/SearchRequest`,
		{
			_jsns: 'urn:zimbraMail',
			limit: 101,
			needExp: 1,
			recip: '2',
			fullConversation: 1,
			wantContent: 'full',
			sortBy: 'dateDesc',
			// query: 'inId:"2"',
			types: 'message'
		},
		'SearchRequest',
		id
	);
