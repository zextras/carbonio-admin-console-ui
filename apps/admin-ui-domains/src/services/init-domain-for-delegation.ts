/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type {
	InitDomainForDelegationRequest,
	InitDomainForDelegationResponse
} from '../../types';

export const InitDomainForDelegation = async (
	api: string,
	body: InitDomainForDelegationRequest
): Promise<InitDomainForDelegationResponse> =>
	fetch(`/service/extension/zextras_admin${api}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	}).then((r) => r.json() as Promise<InitDomainForDelegationResponse>);
