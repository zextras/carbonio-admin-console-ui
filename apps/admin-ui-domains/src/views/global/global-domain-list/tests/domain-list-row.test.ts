/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { flattenDomainAttributes } from '../domain-list-row';

describe('flattenDomainAttributes', () => {
	it('flattens parsed attributes onto the domain row', () => {
		const row = flattenDomainAttributes({
			name: 'example.com',
			id: 'domain-1',
			a: [
				{ n: 'zimbraDomainStatus', _content: 'active' },
				{ n: 'zimbraDomainType', _content: 'local' },
				{ n: 'description', _content: 'Primary domain' },
				{ n: 'zimbraCreateTimestamp', _content: '20240101120000Z' },
			],
		});

		expect(row).toMatchObject({
			id: 'domain-1',
			name: 'example.com',
			zimbraDomainStatus: 'active',
			zimbraDomainType: 'local',
			description: 'Primary domain',
			zimbraCreateTimestamp: '20240101120000Z',
		});
	});

	it('defaults status to active and empty optional fields when attrs are missing', () => {
		const row = flattenDomainAttributes({ name: 'fallback.com', id: 'domain-fb', a: [] });

		expect(row.zimbraDomainStatus).toBe('active');
		expect(row.description).toBe('');
		expect(row.zimbraCreateTimestamp).toBe('');
		expect(row.zimbraDomainName).toBe('fallback.com');
	});
});
