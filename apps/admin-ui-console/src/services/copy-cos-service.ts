/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

export const copyCos = async (newName: string, cosId: string): Promise<any> =>
	soapFetch(`CopyCos`, {
		_jsns: 'urn:zimbraAdmin',
		name: {
			_content: newName
		},
		cos: {
			by: 'id',
			_content: cosId
		}
	});
