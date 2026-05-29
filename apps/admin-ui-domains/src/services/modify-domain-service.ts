/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { ModifyDomainRequest, ModifyDomainResponse } from '../../types';

export const modifyDomain = async (body: ModifyDomainRequest): Promise<ModifyDomainResponse> =>
	soapFetch<ModifyDomainRequest, ModifyDomainResponse>(`ModifyDomain`, {
		...body
	});
