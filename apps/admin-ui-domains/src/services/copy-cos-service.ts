/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export type CopyCosResponse = {
	cos?: Array<{ id: string }>;
};

type CopyCosRequest = {
	_jsns: 'urn:zimbraAdmin';
	name: { _content: string };
	cos: { by: 'id'; _content: string };
};

export const copyCos = async (newName: string, cosId: string): Promise<CopyCosResponse> =>
	soapFetch<CopyCosRequest, CopyCosResponse>(`CopyCos`, {
		_jsns: 'urn:zimbraAdmin',
		name: {
			_content: newName
		},
		cos: {
			by: 'id',
			_content: cosId
		}
	});
