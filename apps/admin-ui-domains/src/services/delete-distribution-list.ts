/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { DeleteDistributionListRequest, SoapEmptyResponse } from '../../types';

export const deleteDistributionList = async (dlId: string): Promise<SoapEmptyResponse> =>
	soapFetch<DeleteDistributionListRequest, SoapEmptyResponse>(`DeleteDistributionList`, {
		_jsns: 'urn:zimbraAdmin',
		id: { _content: dlId }
	});
