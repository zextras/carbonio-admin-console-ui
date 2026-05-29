/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { GetCosRequest, GetCosResponse } from '../../types';

export const getCosGeneralInformation = async (cosId: string): Promise<GetCosResponse> =>
	soapFetch<GetCosRequest, GetCosResponse>(`GetCos`, {
		_jsns: 'urn:zimbraAdmin',
		cos: {
			by: 'id',
			_content: cosId
		}
	});

export type CosA = {
	n: string;
	_content: string;
};
export type { GetCosResponse } from '../../types';
