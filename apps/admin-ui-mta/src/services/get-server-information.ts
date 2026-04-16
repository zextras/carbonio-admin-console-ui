/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { Server } from '../../types';

type GetServerResponse = { server: Array<Server> };

export const getServerInformationByName = async (
	serverName: string,
	applyConfig?: boolean,
): Promise<GetServerResponse> =>
	soapFetch(`GetServer`, {
		_jsns: 'urn:zimbraAdmin',
		server: {
			by: 'name',
			_content: serverName
		},
		applyConfig: applyConfig ? 0 : 1
	});
