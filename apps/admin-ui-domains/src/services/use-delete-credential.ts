/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteCredential } from './delete-credential';
import { domainQueryKeys } from './domain-query-keys';

/**
 * Deletes a services-passphrase credential by id. Owns invalidation of the
 * credential list only; snackbars are shown at the call site via
 * `mutate(vars, { onSuccess, onError })` (recorded repo convention).
 */
export const useDeleteCredential = (accountName: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ passwordId }: { passwordId: string }) => {
			const res = await deleteCredential(accountName, passwordId);
			if (!res.ok) {
				throw new Error('delete credential failed');
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
