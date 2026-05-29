/*
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { AddDistributionListAliasRequest, SoapEmptyResponse } from '../../types';

export const addMailingListAliasRequest = async (id: string, alias: string): Promise<SoapEmptyResponse> => {
	const request: AddDistributionListAliasRequest = {
		_jsns: 'urn:zimbraAdmin',
		id,
		alias: alias.trim()
	};

	return soapFetch<AddDistributionListAliasRequest, SoapEmptyResponse>(`AddDistributionListAlias`, {
		...request
	});
};
