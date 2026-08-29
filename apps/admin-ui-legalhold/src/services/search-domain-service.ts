/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getDomainList as searchDomains } from '@zextras/ui-shared';

import type { DomainItem, ServiceResult } from '../../types';

export type GetDomainListResult = ServiceResult<{
	domain: Array<DomainItem>;
	searchTotal: number;
	more: boolean;
}>;

export async function getDomainList(
	searchKeyWord: string,
	offset: number,
	limit?: number,
): Promise<GetDomainListResult> {
	try {
		const data = await searchDomains(searchKeyWord || undefined, offset, limit);
		return {
			type: 'success',
			domain: (data.domain ?? []) as Array<DomainItem>,
			searchTotal: data.searchTotal ?? 0,
			more: data.more ?? false,
		};
	} catch (error) {
		return {
			type: 'error',
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
