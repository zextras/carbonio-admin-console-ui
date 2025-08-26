/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const modifyConfig = async (a: Array<any>): Promise<any> =>
	soapFetch(`ModifyConfig`, {
		_jsns: 'urn:zimbraAdmin',
		a
	});
