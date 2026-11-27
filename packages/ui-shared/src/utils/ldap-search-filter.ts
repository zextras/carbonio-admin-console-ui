/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/** Default attributes for account / distribution-list free-text SearchDirectory queries. */
export const MAILBOX_SEARCH_ATTRIBUTES: Array<string> = [
	'mail',
	'cn',
	'sn',
	'gn',
	'displayName',
	'zimbraMailDeliveryAddress',
];

/** Default attributes for domain free-text SearchDirectory queries. */
export const DOMAIN_SEARCH_ATTRIBUTES: Array<string> = ['zimbraDomainName'];

/**
 * Join LDAP filter fragments. A single fragment is returned as-is; two or more
 * are OR-wrapped: `(|frag1frag2…)`.
 */
export function joinLdapFragments(fragments: Array<string>): string {
	if (fragments.length === 0) {
		return '';
	}
	const joined = fragments.join('');
	return fragments.length > 1 ? `(|${joined})` : joined;
}

/**
 * Build an OR of status equality filters for an enum multi-select.
 * Each id becomes `(&(attribute=id))`, then fragments are OR-joined.
 */
export function statusFilterToLdap(statusIds: Array<string>, attribute: string): string {
	const fragments = statusIds.map((status) => `(&(${attribute}=${status}))`);
	return joinLdapFragments(fragments);
}

/**
 * Combine optional type / status LDAP fragments with a free-text attribute OR
 * into a SearchDirectory `query` string. Wraps with `(&…)` when any two of
 * type, status, or search are present.
 */
export function buildSearchFilterQuery(
	searchStr: string,
	statusFilter: string,
	typeFilter = '',
	searchAttributes: Array<string> = MAILBOX_SEARCH_ATTRIBUTES,
): string {
	let filterQuery = '';
	if (typeFilter) {
		filterQuery += typeFilter;
	}
	if (statusFilter) {
		filterQuery += statusFilter;
	}
	if (searchStr) {
		const clauses = searchAttributes.map((attr) => `(${attr}=*${searchStr}*)`).join('');
		filterQuery += `(|${clauses})`;
	}
	if ((typeFilter && statusFilter) || (statusFilter && searchStr) || (typeFilter && searchStr)) {
		return `(&${filterQuery})`;
	}
	return filterQuery;
}
