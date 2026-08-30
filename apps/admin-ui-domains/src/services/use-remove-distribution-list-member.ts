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
 * membership view must refresh (edit-account callers) and is optional; the
 * mutation vars carry `listId`, whose distribution list detail/membership
 * queries are also invalidated. `mutationScope` optionally tags the mutation
 * with a key so `useIsMutating` can track it from unrelated components.
 * Snackbars stay at the call site via `mutate(vars, { onSuccess, onError })`
 * (recorded repo convention).
 */
export const useRemoveDistributionListMember = (accountId?: string, mutationScope?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationScope ? ['distribution-list-member-remove', mutationScope] : undefined,
		mutationFn: ({ listId, member }: { listId: string; member: string }) =>
			removeDistributionListMember(
				{ n: 'id', _content: listId },
				{ n: 'dlm', _content: member },
			),
		onSuccess: (_data, { listId }) => {
			if (accountId) {
				queryClient.invalidateQueries({
					queryKey: domainQueryKeys.accountMembership(accountId),
				});
			}
			queryClient.invalidateQueries({
				queryKey: domainQueryKeys.distributionList(listId),
			});
			queryClient.invalidateQueries({
				queryKey: domainQueryKeys.distributionLists(),
			});
			queryClient.invalidateQueries({
				queryKey: domainQueryKeys.distributionListMembership(listId),
			});
		},
	});
};
