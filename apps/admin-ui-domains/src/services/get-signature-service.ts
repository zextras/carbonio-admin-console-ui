/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { GetSignaturesResponse } from '../../types';

export const getSingatures = async (accountId: string): Promise<GetSignaturesResponse> => {
	const request = {
		_jsns: 'urn:zimbraAccount' as const
	};
	return postSoapFetchRequest(
		`/service/admin/soap/GetSignaturesRequest`,
		{
			...request
		},
		'GetSignaturesRequest',
		accountId
	);
};
