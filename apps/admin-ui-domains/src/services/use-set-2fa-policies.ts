/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { set2faPolicies } from './set-2fa-policies';

export type Set2faPolicyInput = {
	service: string;
	trustedDevice: number | undefined;
	trustedIpRange: string | undefined;
};

export type Set2faPolicyResult = {
	ok: boolean;
	message?: string;
	error?: string;
};

export function parseSet2faResponse(res: any): Set2faPolicyResult {
	if (!res?.Body?.response?.content) {
		return { ok: false };
	}
	const content = JSON.parse(res.Body.response.content);
	return {
		ok: Boolean(content?.ok),
		message: content?.message,
		error: content?.error,
	};
}

export const useSet2faPolicies = (domain: string | undefined) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: Set2faPolicyInput): Promise<{ message?: string }> => {
			const parsed = parseSet2faResponse(
				await set2faPolicies(domain, input.service, input.trustedDevice, input.trustedIpRange),
			);
			if (!parsed.ok) {
				throw new Error(parsed.error ?? '2fa policy update failed');
			}
			return { message: parsed.message };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: domainQueryKeys.twoFactorPolicies(domain ?? ''),
			});
		},
	});
};
