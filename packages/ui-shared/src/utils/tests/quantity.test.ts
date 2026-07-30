/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, test } from 'vitest';

import { isUnlimitedQuantity } from '../quantity';

describe('isUnlimitedQuantity', () => {
	test('should return true for the unlimited sentinel values', () => {
		expect(isUnlimitedQuantity('-1')).toBe(true);
		expect(isUnlimitedQuantity('unlimited')).toBe(true);
		expect(isUnlimitedQuantity('999999')).toBe(true);
	});

	test('should be case-insensitive for the unlimited keyword', () => {
		expect(isUnlimitedQuantity('Unlimited')).toBe(true);
		expect(isUnlimitedQuantity('UNLIMITED')).toBe(true);
		expect(isUnlimitedQuantity('Unlimited')).toBe(true);
	});

	test('should trim surrounding whitespace', () => {
		expect(isUnlimitedQuantity('  unlimited  ')).toBe(true);
		expect(isUnlimitedQuantity(' -1 ')).toBe(true);
		expect(isUnlimitedQuantity('  999999 ')).toBe(true);
	});

	test('should accept numeric input', () => {
		expect(isUnlimitedQuantity(-1)).toBe(true);
		expect(isUnlimitedQuantity(999999)).toBe(true);
	});

	test('should return true regardless of the enabled flag handling (quantity only)', () => {
		expect(isUnlimitedQuantity('unlimited')).toBe(true);
	});

	test('should return false for finite quantities', () => {
		expect(isUnlimitedQuantity('0')).toBe(false);
		expect(isUnlimitedQuantity('1')).toBe(false);
		expect(isUnlimitedQuantity('100')).toBe(false);
		expect(isUnlimitedQuantity('500')).toBe(false);
		expect(isUnlimitedQuantity(100)).toBe(false);
	});

	test('should return false for none or other strings', () => {
		expect(isUnlimitedQuantity('none')).toBe(false);
		expect(isUnlimitedQuantity('active')).toBe(false);
		expect(isUnlimitedQuantity('9999999')).toBe(false);
	});

	test('should return false for nullish values', () => {
		expect(isUnlimitedQuantity(undefined)).toBe(false);
		expect(isUnlimitedQuantity(null)).toBe(false);
		expect(isUnlimitedQuantity('')).toBe(false);
	});
});
