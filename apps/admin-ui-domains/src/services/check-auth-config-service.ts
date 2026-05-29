/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { CheckAuthConfigRequest, CheckAuthConfigResponse } from '../../types';

export const CheckAuthConfig = async (body: CheckAuthConfigRequest): Promise<CheckAuthConfigResponse> =>
	soapFetch<CheckAuthConfigRequest, CheckAuthConfigResponse>(`CheckAuthConfig`, {
		...body
	});
