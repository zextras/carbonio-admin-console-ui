/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { removeDistributionListMember } from './remove-distributionlist-member-service';

/**
 * Removes `member` from a distribution list. `accountId` is the account whose
 * membership view must refresh; the hook owns that invalidation only, with
 * snackbars at the call site via `mutate(vars, { onSuccess, onError })`
 * (recorded repo convention).
 */
export const useRemoveDistributionListMember = (accountId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ listId, member }: { listId: string; member: string }) =>
			removeDistributionListMember(listId, member),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: domainQueryKeys.accountMembership(accountId),
			});
		},
	});
};
