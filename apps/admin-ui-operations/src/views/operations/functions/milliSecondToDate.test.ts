/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { MilliSecondToDate } from './milliSecondToDate';

describe('MilliSecondToDate', () => {
	it('formats a morning time as AM', () => {
		const time = new Date('2025-03-24T03:30:00Z').getTime();
		const result = MilliSecondToDate(time);

		expect(result).toContain('03:30 AM');
	});

	it('formats an afternoon time as PM', () => {
		const time = new Date('2025-03-24T15:45:00Z').getTime();
		const result = MilliSecondToDate(time);

		expect(result).toContain('03:45 PM');
	});

	it('renders midnight as 12:00 AM', () => {
		const time = new Date('2025-03-24T00:00:00Z').getTime();
		const result = MilliSecondToDate(time);

		expect(result).toContain('12:00 AM');
	});

	it('renders noon as 12:00 PM', () => {
		const time = new Date('2025-03-24T12:00:00Z').getTime();
		const result = MilliSecondToDate(time);

		expect(result).toContain('12:00 PM');
	});

	it('includes the formatted date', () => {
		const time = new Date('2025-03-24T09:00:00Z').getTime();
		const result = MilliSecondToDate(time);

		expect(result).toMatch(/2025/);
	});
});
