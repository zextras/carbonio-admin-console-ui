/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addCredential } from './add-credential';
import { domainQueryKeys } from './domain-query-keys';

/**
 * Adds a services-passphrase credential for `accountName`. Owns invalidation
 * of the credential list only; snackbars are shown at the call site via
 * `mutate(vars, { onSuccess, onError })` (recorded repo convention).
 */
export const useAddCredential = (accountName: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			label,
			services,
		}: {
			label: string;
			services: string;
		}) => {
			const res = await addCredential(accountName, label, services);
			if (!res.ok) {
				throw new Error('add credential failed');
			}
			return res;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: domainQueryKeys.credentialList(accountName),
			});
		},
	});
};
