/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getSingatures } from './get-signature-service';

export function parseSignatures(res: any): Array<any> {
	return res?.Body?.GetSignaturesResponse?.signature ?? [];
}

export const useSignatures = (accountId: string | undefined) =>
	useQuery({
		queryKey: domainQueryKeys.accountSignatures(accountId ?? ''),
		queryFn: async () => parseSignatures(await getSingatures(accountId!)),
		enabled: !!accountId,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
