/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getAccountMembershipRequest } from './get-account-membership';

export const useAccountMembership = (accountId: string | undefined) =>
	useQuery({
		queryKey: domainQueryKeys.accountMembership(accountId ?? ''),
		queryFn: async () => (await getAccountMembershipRequest(accountId!))?.dl ?? [],
		enabled: !!accountId,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
