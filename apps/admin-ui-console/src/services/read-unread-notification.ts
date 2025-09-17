/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrapper';

export const readUnreadNotification = async (
	notificationId: string,
	value: boolean
): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap/zextras`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'setNotificationAttr',
			notificationId,
			targetServers: 'all_servers',
			key: 'ack',
			value
		},
		'zextras'
	);
