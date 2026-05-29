/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { ZextrasRawResponse } from '../../types';
import { ZX_MOBILE } from '../constants';

export const doPurgeActiveSync = async (): Promise<ZextrasRawResponse> =>
	postSoapFetchRequest(
		`/service/admin/soap`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: ZX_MOBILE,
			action: 'doPurgeMobileState'
		},
		'zextras'
	);
