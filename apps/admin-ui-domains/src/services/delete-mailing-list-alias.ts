/*
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { RemoveDistributionListAliasRequest, SoapEmptyResponse } from '../../types';

export const deleteMailingListAliasRequest = async (id: string, alias: string): Promise<SoapEmptyResponse> => {
	const request: RemoveDistributionListAliasRequest = {
		_jsns: 'urn:zimbraAdmin',
		id,
		alias: alias.trim()
	};

	return soapFetch<RemoveDistributionListAliasRequest, SoapEmptyResponse>(`RemoveDistributionListAlias`, {
		...request
	});
};
