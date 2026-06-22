/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { getDateFromStr, getFormatedDate } from '../utils';

describe('getDateFromStr', () => {
	it('should return null for null input', () => {
		expect(getDateFromStr(null as unknown as string)).toBeNull();
	});

	it('should return null for undefined input', () => {
		expect(getDateFromStr(undefined as unknown as string)).toBeNull();
	});

	it('should parse date with millis and timezone', () => {
		const result = getDateFromStr('20240115123045.123Z');
		expect(result).toBeInstanceOf(Date);
		expect(result?.getFullYear()).toBe(2024);
	});

	it('should parse date without millis', () => {
		const result = getDateFromStr('20240115123045Z');
		expect(result).toBeInstanceOf(Date);
		expect(result?.getFullYear()).toBe(2024);
		expect(result?.getMonth()).toBe(0);
		expect(result?.getDate()).toBe(15);
	});

	it('should parse date string without time as fallback', () => {
		const result = getDateFromStr('20240115');
		expect(result).toBeInstanceOf(Date);
		expect(result?.getFullYear()).toBe(2024);
		expect(result?.getMonth()).toBe(0);
		expect(result?.getDate()).toBe(15);
	});
});

describe('getFormatedDate', () => {
	it('should return null for null input', () => {
		expect(getFormatedDate(null)).toBeNull();
	});

	it('should return null for undefined input', () => {
		expect(getFormatedDate(undefined as unknown as Date | null)).toBeNull();
	});

	it('should format a date correctly', () => {
		const date = new Date(2024, 0, 15, 10, 30, 45);
		const result = getFormatedDate(date);
		expect(result).toBe('2024/1/15 | 10:30:45');
	});

	it('should pad single digit values', () => {
		const date = new Date(2024, 2, 5, 3, 7, 9);
		const result = getFormatedDate(date);
		expect(result).toBe('2024/3/5 | 3:7:9');
	});
});
