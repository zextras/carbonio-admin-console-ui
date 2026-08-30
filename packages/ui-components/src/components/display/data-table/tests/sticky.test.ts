/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { getStickyColumnStyle } from '../sticky';

const unpinnedColumn = { getIsPinned: () => false } as never;
const startColumn = {
	getIsPinned: () => 'start' as const,
	getStart: (position?: string) => (position === 'start' ? 120 : 0),
	getAfter: () => 0,
} as never;
const endColumn = {
	getIsPinned: () => 'end' as const,
	getStart: () => 0,
	getAfter: (position?: string) => (position === 'end' ? 80 : 0),
} as never;

describe('getStickyColumnStyle', () => {
	it('returns an empty style for unpinned columns', () => {
		expect(getStickyColumnStyle(unpinnedColumn)).toEqual({});
	});

	it('returns the start offset for start-pinned columns', () => {
		expect(getStickyColumnStyle(startColumn)).toEqual({ left: 120 });
	});

	it('returns the after offset for end-pinned columns', () => {
		expect(getStickyColumnStyle(endColumn)).toEqual({ right: 80 });
	});
});
