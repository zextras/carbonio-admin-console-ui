/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Builds the LDAP filter fragment for the distribution list search:
 * combines the status filter and the free-text search exactly like the
 * original `generateSearchFilterQuery`.
 */
export function buildSearchFilterQuery(searchStr: string, statusFilter: string): string {
	let filterQuery = '';
	if (statusFilter) {
		filterQuery += statusFilter;
	}
	if (searchStr) {
		filterQuery += `(|(mail=*${searchStr}*)(cn=*${searchStr}*)(sn=*${searchStr}*)(gn=*${searchStr}*)(displayName=*${searchStr}*)(zimbraMailDeliveryAddress=*${searchStr}*))`;
	}
	if (statusFilter && searchStr) {
		return `(&${filterQuery})`;
	}
	return filterQuery;
}
