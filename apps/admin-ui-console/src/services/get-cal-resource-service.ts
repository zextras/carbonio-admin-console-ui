/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getCalenderResource = async (resourceId: string): Promise<any> =>
	soapFetch(`GetCalendarResource`, {
		_jsns: 'urn:zimbraAdmin',
		calresource: {
			by: 'id',
			_content: resourceId
		},
		applyCos: '0'
	});
