/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { IssueCertRequest, IssueCertResponse } from '../../types';

export const IssueCertiRequest = async (
	domain: string | undefined,
	chainType: string
): Promise<IssueCertResponse> =>
	soapFetch<IssueCertRequest, IssueCertResponse>(`IssueCert`, {
		_jsns: 'urn:zimbraAdmin',
		domain,
		chainType
	});
