/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ZIMBRA_ADMIN_URN } from '../constants';
import { soapFetch } from '../network/fetch';
import type { SoapAttribute } from './domain-search-service';

export type SoapAccount = {
	id?: string;
	name?: string;
	a?: Array<SoapAttribute>;
};

export type GetAccountSoapResponse = {
	account?: Array<SoapAccount>;
	_jsns?: string;
};

type FetchAccountOptions = {
	applyCos?: number;
	attrs?: Array<string>;
};

/**
 * Fetches an account through a GetAccount SOAP request, looking it up by
 * `id` or `name`, optionally applying the COS and restricting attributes.
 */
export const fetchAccount = async (
	by: 'id' | 'name',
	value: string,
	options?: FetchAccountOptions
): Promise<GetAccountSoapResponse> => {
	const request: Record<string, unknown> = {
		_jsns: ZIMBRA_ADMIN_URN,
		account: { by, _content: value }
	};
	if (options?.applyCos !== undefined) {
		request.applyCos = options.applyCos;
	}
	if (options?.attrs && options.attrs.length > 0) {
		request.attrs = options.attrs.join(',');
	}
	return soapFetch<Record<string, unknown>, GetAccountSoapResponse>('GetAccount', request);
};
