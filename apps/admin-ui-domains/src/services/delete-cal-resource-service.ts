/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { DeleteCalendarResourceRequest, SoapEmptyResponse } from '../../types';

export const deleteCalendarResource = async (resourceId: string): Promise<SoapEmptyResponse> =>
	soapFetch<DeleteCalendarResourceRequest, SoapEmptyResponse>(`DeleteCalendarResource`, {
		_jsns: 'urn:zimbraAdmin',
		id: resourceId
	});
