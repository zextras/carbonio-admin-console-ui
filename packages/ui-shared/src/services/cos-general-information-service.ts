/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '../network/fetch';

export type CosAttribute = {
	n: string;
	_content: string;
	c?: boolean;
};

export type CosEntry = {
	name?: string;
	id?: string;
	isDefaultCos?: boolean;
	a?: Array<CosAttribute>;
	_attrs?: Record<string, string>;
};

export type GetCosResponse = {
	cos: Array<CosEntry>;
};

export const getCosGeneralInformation = async (cosId: string): Promise<GetCosResponse> =>
	soapFetch(`GetCos`, {
		_jsns: 'urn:zimbraAdmin',
		cos: {
			by: 'id',
			_content: cosId,
		},
	});
