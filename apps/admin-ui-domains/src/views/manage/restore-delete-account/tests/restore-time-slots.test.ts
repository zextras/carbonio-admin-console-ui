/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { clampRestoreDate, getRestoreTimeSlots, withRestoreTime } from '../restore-time-slots';

describe('clampRestoreDate', () => {
	const NOW = new Date(2026, 10, 4, 15, 20);

	it('should keep a date that is not in the future', () => {
		const date = new Date(2026, 10, 3, 21, 15);

		expect(clampRestoreDate(date, NOW)).toEqual(date);
	});

	it('should move a future time to the latest enabled slot', () => {
		expect(clampRestoreDate(new Date(2026, 10, 4, 21, 0), NOW)).toEqual(
			new Date(2026, 10, 4, 15, 15),
		);
	});
});

describe('getRestoreTimeSlots', () => {
	const NOW = new Date(2026, 10, 4, 15, 20);

	it('should label every 15 minute slot of the day with AM/PM', () => {
		const slots = getRestoreTimeSlots(new Date(2026, 10, 3), NOW);

		expect(slots).toHaveLength(96);
		expect(slots[0]).toMatchObject({ label: '12:00 AM', value: '00:00' });
		expect(slots[37]).toMatchObject({ label: '09:15 AM', value: '09:15' });
		expect(slots[84]).toMatchObject({ label: '09:00 PM', value: '21:00' });
	});

	it('should disable only the future slots when the date is today', () => {
		const slots = getRestoreTimeSlots(new Date(2026, 10, 4), NOW);

		expect(slots.find((slot) => slot.value === '15:15')?.disabled).toBe(false);
		expect(slots.find((slot) => slot.value === '15:30')?.disabled).toBe(true);
	});

	it('should keep every slot enabled when the date is in the past', () => {
		const slots = getRestoreTimeSlots(new Date(2026, 10, 3), NOW);

		expect(slots.some((slot) => slot.disabled)).toBe(false);
	});
});

describe('withRestoreTime', () => {
	it('should apply the slot time to the date', () => {
		expect(withRestoreTime(new Date(2026, 10, 3), '21:15')).toEqual(
			new Date(2026, 10, 3, 21, 15),
		);
	});
});
