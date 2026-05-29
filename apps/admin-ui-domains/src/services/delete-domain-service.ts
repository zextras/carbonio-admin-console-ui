/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { DeleteDomainRequest, SoapEmptyResponse } from '../../types';

export const deleteDomain = async (domainId: string): Promise<SoapEmptyResponse> =>
	soapFetch<DeleteDomainRequest, SoapEmptyResponse>(`DeleteDomain`, {
		_jsns: 'urn:zimbraAdmin',
		id: domainId
	});
