/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { buildSearchFilterQuery } from '../mailing-list-query';

describe('mailing-list-query', () => {
	it('returns an empty query without search text or status filter', () => {
		expect(buildSearchFilterQuery('', '')).toBe('');
	});

	it('wraps the free-text search in an any-attribute clause', () => {
		expect(buildSearchFilterQuery('team', '')).toBe(
			'(|(mail=*team*)(cn=*team*)(sn=*team*)(gn=*team*)(displayName=*team*)(zimbraMailDeliveryAddress=*team*))'
		);
	});

	it('uses the status filter alone when there is no search text', () => {
		expect(buildSearchFilterQuery('', '(&(zimbraMailStatus=enabled))')).toBe(
			'(&(zimbraMailStatus=enabled))'
		);
	});

	it('combines status filter and search text with an and clause', () => {
		expect(buildSearchFilterQuery('team', '(&(zimbraMailStatus=enabled))')).toBe(
			'(&(&(zimbraMailStatus=enabled))(|(mail=*team*)(cn=*team*)(sn=*team*)(gn=*team*)(displayName=*team*)(zimbraMailDeliveryAddress=*team*)))'
		);
	});
});
