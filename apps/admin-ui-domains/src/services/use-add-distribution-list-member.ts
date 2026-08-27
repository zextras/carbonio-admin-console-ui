/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addDistributionListMember } from './add-distributionlist-member-service';
import { domainQueryKeys } from './domain-query-keys';

/**
 * Adds `member` as a member of a distribution list. `accountId` is the account
 * whose membership view must refresh (edit-account callers) and is optional;
 * the mutation vars carry `listId`, whose distribution list detail/membership
 * queries are also invalidated. Snackbars stay at the call site via
 * `mutate(vars, { onSuccess, onError })` (recorded repo convention).
 */
export const useAddDistributionListMember = (accountId?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ listId, member }: { listId: string; member: string }) =>
			addDistributionListMember(
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
				queryKey: domainQueryKeys.distributionListMembership(listId),
			});
		},
	});
};
