/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { AddAccountAliasRequest, SoapEmptyResponse } from '../../types';

export const addAccountAliasRequest = async (id: string, alias: string): Promise<SoapEmptyResponse> => {
	const request: AddAccountAliasRequest = {
		_jsns: 'urn:zimbraAdmin',
		id,
		alias: alias.trim()
	};

	return soapFetch<AddAccountAliasRequest, SoapEmptyResponse>(`AddAccountAlias`, {
		...request
	});
};
