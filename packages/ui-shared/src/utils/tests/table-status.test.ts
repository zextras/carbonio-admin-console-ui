/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, test } from 'vitest';

import { enumFilterValues, resolveTableStatus } from '../table-status';

describe('resolveTableStatus', () => {
	test('should return loading while the query is pending', () => {
		expect(resolveTableStatus(true, false, 0)).toBe('loading');
	});

	test('should return error when the query failed', () => {
		expect(resolveTableStatus(false, true, 10)).toBe('error');
	});

	test('should let pending win over error', () => {
		expect(resolveTableStatus(true, true, 0)).toBe('loading');
	});

	test('should return empty for a resolved query without rows', () => {
		expect(resolveTableStatus(false, false, 0)).toBe('empty');
	});

	test('should return idle when rows are on screen', () => {
		expect(resolveTableStatus(false, false, 1)).toBe('idle');
	});
});

describe('enumFilterValues', () => {
	test('should return the string array of an enum filter', () => {
		expect(enumFilterValues({ status: ['active', 'locked'] }, 'status')).toEqual([
			'active',
			'locked',
		]);
	});

	test('should return an empty list for a missing filter id', () => {
		expect(enumFilterValues({ type: ['admin'] }, 'status')).toEqual([]);
	});

	test('should return an empty list for non-array filter values', () => {
		expect(enumFilterValues({ status: 'active' }, 'status')).toEqual([]);
		expect(enumFilterValues({ status: { min: 1, max: 2 } }, 'status')).toEqual([]);
		expect(enumFilterValues({ status: null }, 'status')).toEqual([]);
	});
});
