/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import { ASC } from '../constants';

export const DOMAIN_LIST_ATTRS =
	'description,zimbraDomainName,zimbraDomainStatus,zimbraId,zimbraDomainType,zimbraCreateTimestamp';

export type DomainListDirectoryParams = {
	query: string;
	offset: number;
	limit: number;
	sortBy?: string;
	sortAscending?: string;
};

/**
 * SearchDirectory for the global domains DataTable. Shared `getDomainList`
 * stays unchanged for sidebar / dashboard consumers.
 */
export async function domainListDirectory({
	query,
	offset,
	limit,
	sortBy,
	sortAscending,
}: DomainListDirectoryParams): Promise<unknown> {
	const request: Record<string, unknown> = {
		_jsns: 'urn:zimbraAdmin',
		offset,
		limit,
		applyCos: 'false',
		applyConfig: 'false',
		attrs: DOMAIN_LIST_ATTRS,
		types: 'domains',
	};
	if (query !== '') {
		request.query = query;
	}
	if (sortBy) {
		request.sortBy = sortBy;
	}
	if (sortAscending) {
		request.sortAscending = sortAscending === ASC ? 1 : 0;
	}
	return soapFetch('SearchDirectory', request);
}
