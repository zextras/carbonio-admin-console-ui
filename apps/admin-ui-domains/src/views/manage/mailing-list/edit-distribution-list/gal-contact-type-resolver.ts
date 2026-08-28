/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from '../../../../services/domain-query-keys';
import { type OwnerTypeSource,resolveOwnerType } from './owners-tab/owner-type';

/**
 * Resolves the grantee type (usr/grp/email) for owner add/remove actions.
 * Instead of accumulating past GAL search results in component state, this
 * reads every cached `galSearch` query result — the React Query cache is the
 * accumulated search history (30s stale time per keyword).
 */
export function useGalContactTypeResolver(): (email?: string) => string {
	const queryClient = useQueryClient();

	function resolveOwnerTypeFromCache(email?: string): string {
		const galSearchRoot = [domainQueryKeys.all[0], 'gal-search'];
		const sources: Array<OwnerTypeSource> = queryClient
			.getQueryCache()
			.getAll()
			.filter(
				(query) =>
					Array.isArray(query.queryKey) &&
					query.queryKey[0] === galSearchRoot[0] &&
					query.queryKey[1] === galSearchRoot[1] &&
					query.state.status === 'success'
			)
			.flatMap((query) => {
				const contacts = (query.state.data as any)?.cn ?? [];
				return contacts.map((contact: any) => ({
					id: contact?.id,
					name: contact?._attrs?.email,
					type: contact?._attrs?.type,
					email: contact?._attrs?.email
				}));
			});
		return resolveOwnerType(sources, email);
	}

	return resolveOwnerTypeFromCache;
}
