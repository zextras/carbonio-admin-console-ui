/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { GetAllConfigRequest, GetAllConfigResponse } from '../../types';

export const getAllConfig = async (): Promise<GetAllConfigResponse> =>
	soapFetch<GetAllConfigRequest, GetAllConfigResponse>(`GetAllConfig`, {
		_jsns: 'urn:zimbraAdmin'
	});
