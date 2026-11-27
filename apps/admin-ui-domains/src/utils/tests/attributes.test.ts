/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Attribute } from '../../../types';
import { attributesToObject } from '../attributes';

describe('attributesToObject', () => {
	it('builds a record keyed by the attribute name', () => {
		const attrs: Array<Attribute> = [
			{ n: 'zimbraDomainStatus', _content: 'locked' },
			{ n: 'zimbraId', _content: 'abc-123' },
		];
		expect(attributesToObject(attrs)).toEqual({
			zimbraDomainStatus: 'locked',
			zimbraId: 'abc-123',
		});
	});

	it('returns an empty object for an empty array', () => {
		expect(attributesToObject([])).toEqual({});
	});

	it('keeps the last value when a key repeats', () => {
		const attrs: Array<Attribute> = [
			{ n: 'zimbraDomainStatus', _content: 'active' },
			{ n: 'zimbraDomainStatus', _content: 'locked' },
		];
		expect(attributesToObject(attrs)).toEqual({ zimbraDomainStatus: 'locked' });
	});
});
