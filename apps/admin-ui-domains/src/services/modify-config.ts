/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { ModifyConfigRequest, SoapAttribute, SoapEmptyResponse } from '../../types';

export const modifyConfig = async (a: Array<SoapAttribute>): Promise<SoapEmptyResponse> =>
	soapFetch<ModifyConfigRequest, SoapEmptyResponse>(`ModifyConfig`, {
		_jsns: 'urn:zimbraAdmin',
		a
	});
