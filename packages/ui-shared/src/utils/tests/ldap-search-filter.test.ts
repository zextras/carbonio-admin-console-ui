/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';

import {
	buildSearchFilterQuery,
	DOMAIN_SEARCH_ATTRIBUTES,
	joinLdapFragments,
	MAILBOX_SEARCH_ATTRIBUTES,
	statusFilterToLdap,
} from '../ldap-search-filter';

describe('joinLdapFragments', () => {
	test('returns empty string for no fragments', () => {
		expect(joinLdapFragments([])).toBe('');
	});

	test('returns a single fragment unchanged', () => {
		expect(joinLdapFragments(['(&(zimbraAccountStatus=active))'])).toBe(
			'(&(zimbraAccountStatus=active))',
		);
	});

	test('OR-wraps two or more fragments', () => {
		expect(
			joinLdapFragments(['(&(zimbraAccountStatus=active))', '(&(zimbraAccountStatus=locked))']),
		).toBe('(|(&(zimbraAccountStatus=active))(&(zimbraAccountStatus=locked)))');
	});
});

describe('statusFilterToLdap', () => {
	test('returns empty string for no statuses', () => {
		expect(statusFilterToLdap([], 'zimbraAccountStatus')).toBe('');
	});

	test('builds a single status filter', () => {
		expect(statusFilterToLdap(['active'], 'zimbraDomainStatus')).toBe(
			'(&(zimbraDomainStatus=active))',
		);
	});

	test('OR-joins multiple statuses', () => {
		expect(statusFilterToLdap(['active', 'locked'], 'zimbraAccountStatus')).toBe(
			'(|(&(zimbraAccountStatus=active))(&(zimbraAccountStatus=locked)))',
		);
	});
});

describe('buildSearchFilterQuery', () => {
	test('returns empty query without search text or filters', () => {
		expect(buildSearchFilterQuery('', '')).toBe('');
	});

	test('wraps free-text search with default mailbox attributes', () => {
		const attrClauses = MAILBOX_SEARCH_ATTRIBUTES.map((attr) => `(${attr}=*team*)`).join('');
		expect(buildSearchFilterQuery('team', '')).toBe(`(|${attrClauses})`);
	});

	test('uses the status filter alone when there is no search text', () => {
		expect(buildSearchFilterQuery('', '(&(zimbraMailStatus=enabled))')).toBe(
			'(&(zimbraMailStatus=enabled))',
		);
	});

	test('combines status filter and search text with an and clause', () => {
		const attrClauses = MAILBOX_SEARCH_ATTRIBUTES.map((attr) => `(${attr}=*team*)`).join('');
		expect(buildSearchFilterQuery('team', '(&(zimbraMailStatus=enabled))')).toBe(
			`(&(&(zimbraMailStatus=enabled))(|${attrClauses}))`,
		);
	});

	test('combines type, status, and search for accounts', () => {
		const typeFilter = '(&(zimbraIsAdminAccount=TRUE))';
		const statusFilter = '(&(zimbraAccountStatus=active))';
		const attrClauses = MAILBOX_SEARCH_ATTRIBUTES.map((attr) => `(${attr}=*alice*)`).join('');
		expect(buildSearchFilterQuery('alice', statusFilter, typeFilter)).toBe(
			`(&${typeFilter}${statusFilter}(|${attrClauses}))`,
		);
	});

	test('uses domain search attributes when provided', () => {
		expect(buildSearchFilterQuery('exam', '', '', DOMAIN_SEARCH_ATTRIBUTES)).toBe(
			'(|(zimbraDomainName=*exam*))',
		);
		expect(
			buildSearchFilterQuery('exam', '(&(zimbraDomainStatus=active))', '', DOMAIN_SEARCH_ATTRIBUTES),
		).toBe('(&(&(zimbraDomainStatus=active))(|(zimbraDomainName=*exam*)))');
	});
});
