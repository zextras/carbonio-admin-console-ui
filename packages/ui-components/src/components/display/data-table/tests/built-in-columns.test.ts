/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { buildExpanderColumn } from '../expander-column';
import { buildSelectionColumn } from '../selection-column';

describe('buildSelectionColumn', () => {
	it('builds a display column def with the selection id', () => {
		const column = buildSelectionColumn();
		expect(column.id).toBe('data-table-select');
		expect(column.size).toBe(40);
	});
});

describe('buildExpanderColumn', () => {
	it('builds a display column def with the expander id', () => {
		const column = buildExpanderColumn();
		expect(column.id).toBe('data-table-expander');
		expect(column.size).toBe(40);
	});
});
