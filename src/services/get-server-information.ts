/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getServerInformationByName = async (serverName: string): Promise<any> =>
	soapFetch(`GetServer`, {
		_jsns: 'urn:zimbraAdmin',
		server: {
			by: 'name',
			_content: serverName
		}
	});
