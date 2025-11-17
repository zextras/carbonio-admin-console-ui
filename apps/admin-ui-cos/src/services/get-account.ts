/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';

export const getAccountRequest = async (
	id: string,
	name: string,
	applyCos: number,
	attrs?: Array<string>
): Promise<any> => {
	let request: any = {
		_jsns: 'urn:zimbraAdmin',
		account: [
			{
				_content: id || name,
				by: id ? 'id' : 'name'
			}
		],
		applyCos
	};

	if (attrs?.length && attrs?.length > 0) {
		request = {
			...request,
			attrs: attrs.join(',')
		};
	}

	return soapFetch(`GetAccount`, {
		...request
	});
};
