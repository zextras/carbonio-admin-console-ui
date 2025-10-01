/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrap';

export const dumpGlobalConfig = async (serverName: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		module: 'ZxConfig',
		action: 'dump_global_config'
		// targetServers: serverName
	};

	return postSoapFetchRequest(`/service/admin/soap/zextras`, request, 'zextras');
};
